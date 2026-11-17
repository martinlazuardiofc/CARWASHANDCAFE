import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);

    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    let query = `
      SELECT m.*, c.name as category_name, c.slug as category_slug
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (!includeDeleted) {
      query += ` AND m.deleted_at IS NULL`;
    }

    if (categorySlug && categorySlug !== 'all') {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(categorySlug, categorySlug);
    }

    if (search && search.trim() !== '') {
      query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (featured === 'true' || featured === '1') {
      query += ` AND m.is_featured = 1`;
    }

    if (minPrice) {
      query += ` AND m.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND m.price <= ?`;
      params.push(Number(maxPrice));
    }

    query += ` ORDER BY m.sort_order ASC, m.name ASC`;

    const items = db.prepare(query).all(...params) as any[];

    // Fetch variants and addons for all returned items
    const allVariants = db.prepare('SELECT * FROM menu_variants').all() as any[];
    const allAddons = db.prepare(`
      SELECT mia.menu_item_id, a.id, a.name, a.price, a.category
      FROM menu_item_addons mia
      JOIN addons a ON mia.addon_id = a.id
      WHERE a.is_active = 1
    `).all() as any[];

    const variantsByMenu = new Map<string, any[]>();
    for (const v of allVariants) {
      if (!variantsByMenu.has(v.menu_item_id)) {
        variantsByMenu.set(v.menu_item_id, []);
      }
      variantsByMenu.get(v.menu_item_id)!.push(v);
    }

    const addonsByMenu = new Map<string, any[]>();
    for (const a of allAddons) {
      if (!addonsByMenu.has(a.menu_item_id)) {
        addonsByMenu.set(a.menu_item_id, []);
      }
      addonsByMenu.get(a.menu_item_id)!.push(a);
    }

    const result = items.map((item) => ({
      ...item,
      variants: variantsByMenu.get(item.id) || [],
      addons: addonsByMenu.get(item.id) || [],
    }));

    return NextResponse.json({ success: true, count: result.length, products: result });
  } catch (error: any) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Gagal memuat produk' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan login sebagai administrator.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      category_id,
      price,
      description,
      image_url,
      is_featured,
      is_available,
      is_draft,
      kasir_product_id,
      sort_order,
      label,
      discount_type,
      discount_value,
      discount_start,
      discount_end,
      variants, // array of { name, price_difference }
      addon_ids, // array of addon ids
    } = body;

    if (!name || !category_id || price === undefined) {
      return NextResponse.json({ error: 'Nama, kategori, dan harga wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const id = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO menu_items (
        id, category_id, name, description, price, image_url,
        is_featured, is_available, is_draft, kasir_product_id, sort_order,
        label, discount_type, discount_value, discount_start, discount_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      category_id,
      name.trim(),
      description || '',
      Number(price),
      image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
      is_featured ? 1 : 0,
      is_available !== undefined ? (is_available ? 1 : 0) : 1,
      is_draft ? 1 : 0,
      kasir_product_id || null,
      Number(sort_order || 99),
      label || null,
      discount_type || null,
      discount_value ? Number(discount_value) : 0,
      discount_start || null,
      discount_end || null
    );

    // Insert variants if provided
    if (Array.isArray(variants)) {
      const insertVar = db.prepare(`
        INSERT INTO menu_variants (id, menu_item_id, name, price_difference)
        VALUES (?, ?, ?, ?)
      `);
      for (const v of variants) {
        if (v.name) {
          insertVar.run(`var-${id}-${Math.random().toString(36).substring(2, 6)}`, id, v.name, Number(v.price_difference || 0));
        }
      }
    }

    // Link addons if provided
    if (Array.isArray(addon_ids)) {
      const linkAddon = db.prepare(`
        INSERT OR IGNORE INTO menu_item_addons (menu_item_id, addon_id)
        VALUES (?, ?)
      `);
      for (const aid of addon_ids) {
        linkAddon.run(id, aid);
      }
    }

    logAudit('CREATE', 'MENU_ITEM', id, { name, price, category_id }, admin);

    return NextResponse.json({ success: true, message: 'Produk berhasil ditambahkan', productId: id });
  } catch (error: any) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menambahkan produk' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const item = db.prepare(`
      SELECT m.*, c.name as category_name, c.slug as category_slug
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = ?
    `).get(params.id) as any;

    if (!item) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const variants = db.prepare('SELECT * FROM menu_variants WHERE menu_item_id = ?').all(params.id) as any[];
    const addons = db.prepare(`
      SELECT a.id, a.name, a.price, a.category
      FROM menu_item_addons mia
      JOIN addons a ON mia.addon_id = a.id
      WHERE mia.menu_item_id = ? AND a.is_active = 1
    `).all(params.id) as any[];

    return NextResponse.json({
      success: true,
      product: {
        ...item,
        variants,
        addons,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat produk' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(params.id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
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
      variants,
      addon_ids,
    } = body;

    db.prepare(`
      UPDATE menu_items
      SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?,
          is_featured = ?, is_available = ?, is_draft = ?, kasir_product_id = ?,
          sort_order = ?, label = ?, discount_type = ?, discount_value = ?,
          discount_start = ?, discount_end = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : existing.name,
      category_id !== undefined ? category_id : existing.category_id,
      price !== undefined ? Number(price) : existing.price,
      description !== undefined ? description : existing.description,
      image_url !== undefined ? image_url : existing.image_url,
      is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
      is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available,
      is_draft !== undefined ? (is_draft ? 1 : 0) : existing.is_draft,
      kasir_product_id !== undefined ? kasir_product_id : existing.kasir_product_id,
      sort_order !== undefined ? Number(sort_order) : existing.sort_order,
      label !== undefined ? label : existing.label,
      discount_type !== undefined ? discount_type : existing.discount_type,
      discount_value !== undefined ? Number(discount_value) : existing.discount_value,
      discount_start !== undefined ? discount_start : existing.discount_start,
      discount_end !== undefined ? discount_end : existing.discount_end,
      params.id
    );

    // Update variants if array provided
    if (Array.isArray(variants)) {
      db.prepare('DELETE FROM menu_variants WHERE menu_item_id = ?').run(params.id);
      const insertVar = db.prepare(`
        INSERT INTO menu_variants (id, menu_item_id, name, price_difference)
        VALUES (?, ?, ?, ?)
      `);
      for (const v of variants) {
        if (v.name) {
          insertVar.run(`var-${params.id}-${Math.random().toString(36).substring(2, 6)}`, params.id, v.name, Number(v.price_difference || 0));
        }
      }
    }

    // Update addons if array provided
    if (Array.isArray(addon_ids)) {
      db.prepare('DELETE FROM menu_item_addons WHERE menu_item_id = ?').run(params.id);
      const linkAddon = db.prepare(`
        INSERT OR IGNORE INTO menu_item_addons (menu_item_id, addon_id)
        VALUES (?, ?)
      `);
      for (const aid of addon_ids) {
        linkAddon.run(params.id, aid);
      }
    }

    logAudit('UPDATE', 'MENU_ITEM', params.id, { name, price, is_available }, admin);

    return NextResponse.json({ success: true, message: 'Produk berhasil diperbarui' });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui produk' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const db = getDb();
    // Soft delete rule: preserves old order transactions
    db.prepare(`
      UPDATE menu_items
      SET deleted_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(params.id);

    logAudit('SOFT_DELETE', 'MENU_ITEM', params.id, { action: 'soft_delete' }, admin);

    return NextResponse.json({ success: true, message: 'Produk berhasil diarsipkan/dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const body = await req.json();
    const db = getDb();

    // Support toggle availability
    if (body.toggleAvailability !== undefined) {
      const item = db.prepare('SELECT is_available FROM menu_items WHERE id = ?').get(params.id) as any;
      if (!item) {
        return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
      }
      const nextVal = item.is_available ? 0 : 1;
      db.prepare("UPDATE menu_items SET is_available = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run(nextVal, params.id);
      logAudit('TOGGLE_AVAILABILITY', 'MENU_ITEM', params.id, { is_available: nextVal }, admin);
      return NextResponse.json({ success: true, is_available: nextVal });
    }

    // Support restore from soft delete
    if (body.restore === true) {
      db.prepare("UPDATE menu_items SET deleted_at = NULL, updated_at = datetime('now', 'localtime') WHERE id = ?").run(params.id);
      logAudit('RESTORE', 'MENU_ITEM', params.id, { action: 'restore' }, admin);
      return NextResponse.json({ success: true, message: 'Produk berhasil dipulihkan' });
    }

    // Support sort order update
    if (body.sort_order !== undefined) {
      db.prepare('UPDATE menu_items SET sort_order = ? WHERE id = ?').run(Number(body.sort_order), params.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui status produk' }, { status: 500 });
  }
}

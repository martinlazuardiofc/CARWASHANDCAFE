import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM menu_items WHERE category_id = c.id AND deleted_at IS NULL) as product_count
      FROM categories c
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat kategori' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const { name, slug, sort_order } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const db = getDb();
    const id = `cat-${cleanSlug}-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT INTO categories (id, name, slug, sort_order, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, name.trim(), cleanSlug, Number(sort_order || 0));

    logAudit('CREATE', 'CATEGORY', id, { name, slug: cleanSlug }, admin);

    return NextResponse.json({ success: true, message: 'Kategori berhasil ditambahkan', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan kategori' }, { status: 500 });
  }
}

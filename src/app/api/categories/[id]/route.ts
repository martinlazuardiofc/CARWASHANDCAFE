import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const { name, slug, sort_order, is_active } = await req.json();
    const db = getDb();

    db.prepare(`
      UPDATE categories
      SET name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      slug ? slug.trim() : null,
      sort_order !== undefined ? Number(sort_order) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      params.id
    );

    logAudit('UPDATE', 'CATEGORY', params.id, { name, is_active }, admin);

    return NextResponse.json({ success: true, message: 'Kategori berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui kategori' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const db = getDb();
    // Check if category has products
    const productCheck = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE category_id = ? AND deleted_at IS NULL').get(params.id) as { count: number };
    if (productCheck && productCheck.count > 0) {
      // Deactivate instead of hard delete
      db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(params.id);
      return NextResponse.json({ success: true, message: 'Kategori memiliki produk aktif. Status diubah menjadi non-aktif.' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(params.id);
    logAudit('DELETE', 'CATEGORY', params.id, {}, admin);

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}

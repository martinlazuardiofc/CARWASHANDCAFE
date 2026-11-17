import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const { name, price, category, is_active } = await req.json();
    const db = getDb();

    db.prepare(`
      UPDATE addons
      SET name = COALESCE(?, name),
          price = COALESCE(?, price),
          category = COALESCE(?, category),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      price !== undefined ? Number(price) : null,
      category || null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      params.id
    );

    logAudit('UPDATE', 'ADDON', params.id, { name, price }, admin);
    return NextResponse.json({ success: true, message: 'Add-on berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui add-on' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const db = getDb();
    db.prepare('DELETE FROM addons WHERE id = ?').run(params.id);
    logAudit('DELETE', 'ADDON', params.id, {}, admin);
    return NextResponse.json({ success: true, message: 'Add-on berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus add-on' }, { status: 500 });
  }
}

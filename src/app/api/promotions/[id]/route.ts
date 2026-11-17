import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const body = await req.json();
    const db = getDb();

    db.prepare(`
      UPDATE promotions
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          discount_type = COALESCE(?, discount_type),
          discount_value = COALESCE(?, discount_value),
          start_at = COALESCE(?, start_at),
          end_at = COALESCE(?, end_at),
          target_type = COALESCE(?, target_type),
          target_id = COALESCE(?, target_id),
          is_active = COALESCE(?, is_active),
          sort_order = COALESCE(?, sort_order)
      WHERE id = ?
    `).run(
      body.title ? body.title.trim() : null,
      body.description !== undefined ? body.description : null,
      body.image_url || null,
      body.discount_type || null,
      body.discount_value !== undefined ? Number(body.discount_value) : null,
      body.start_at || null,
      body.end_at || null,
      body.target_type || null,
      body.target_id || null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
      body.sort_order !== undefined ? Number(body.sort_order) : null,
      params.id
    );

    logAudit('UPDATE', 'PROMOTION', params.id, body, admin);
    return NextResponse.json({ success: true, message: 'Promosi berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui promosi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const db = getDb();
    db.prepare('DELETE FROM promotions WHERE id = ?').run(params.id);
    logAudit('DELETE', 'PROMOTION', params.id, {}, admin);
    return NextResponse.json({ success: true, message: 'Promosi berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus promosi' }, { status: 500 });
  }
}

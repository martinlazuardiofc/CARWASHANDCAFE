import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const body = await req.json();
    const db = getDb();

    // Check if regenerating QR
    if (body.regenerate_qr) {
      const newToken = `token-asia-tbl-${params.id}-${Date.now()}`;
      db.prepare('UPDATE tables SET qr_token = ? WHERE id = ?').run(newToken, params.id);
      logAudit('REGENERATE_QR', 'TABLE', params.id, { qr_token: newToken }, admin);
      return NextResponse.json({ success: true, message: 'QR Code berhasil dibuat ulang', qr_token: newToken });
    }

    db.prepare(`
      UPDATE tables
      SET table_name = COALESCE(?, table_name),
          table_type = COALESCE(?, table_type),
          is_active = COALESCE(?, is_active),
          capacity = COALESCE(?, capacity)
      WHERE id = ?
    `).run(
      body.table_name ? body.table_name.trim() : null,
      body.table_type || null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
      body.capacity !== undefined ? Number(body.capacity) : null,
      params.id
    );

    logAudit('UPDATE', 'TABLE', params.id, body, admin);
    return NextResponse.json({ success: true, message: 'Meja berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui meja' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const db = getDb();
    // Rather than deleting physical table that might break order history, deactivate it
    db.prepare('UPDATE tables SET is_active = 0 WHERE id = ?').run(params.id);
    logAudit('DEACTIVATE', 'TABLE', params.id, {}, admin);
    return NextResponse.json({ success: true, message: 'Meja dinonaktifkan' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menonaktifkan meja' }, { status: 500 });
  }
}

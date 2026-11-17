import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { type } = await req.json(); // 'waiter' | 'bill'
    if (!type || !['waiter', 'bill'].includes(type)) {
      return NextResponse.json({ error: 'Tipe panggilan tidak valid' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(`
      SELECT o.*, t.table_number, t.table_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = ? OR o.order_number = ?
    `).get(params.id, params.id) as any;

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const tableNum = order.table_number || 'UNKNOWN';
    const tableName = order.table_name || order.location || 'Meja';

    // Anti-spam check: check if same table made call within last 45 seconds
    const recentCall = db.prepare(`
      SELECT id, created_at FROM service_calls
      WHERE table_number = ? AND type = ? AND status = 'pending'
      ORDER BY created_at DESC LIMIT 1
    `).get(tableNum, type) as any;

    if (recentCall) {
      return NextResponse.json({
        success: true,
        message: `Permintaan ${type === 'waiter' ? 'Pelayan' : 'Bill'} Anda sudah dikirim dan sedang menuju meja Anda. Mohon tunggu sebentar.`,
      });
    }

    const callId = `call-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO service_calls (id, table_number, table_name, type, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(callId, tableNum, tableName, type);

    return NextResponse.json({
      success: true,
      message: type === 'waiter' ? 'Pelayan kami telah diberi tahu dan segera menuju meja Anda.' : 'Permintaan bill telah dikirim ke kasir. Staff kami akan segera mengantar bill.',
      callId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memproses panggilan' }, { status: 500 });
  }
}

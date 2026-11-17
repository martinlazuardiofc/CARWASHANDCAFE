import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, logAudit } from '@/lib/auth';
import { syncOrderToKasir } from '@/lib/kasirAdapter';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const db = getDb();
    const order = db.prepare('SELECT id, order_number FROM orders WHERE id = ? OR order_number = ?').get(params.id, params.id) as any;
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const result = await syncOrderToKasir(order.id);
    logAudit('RETRY_KASIR_SYNC', 'ORDER', order.id, { result }, admin);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      logId: result.logId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengirim ulang ke kasir' }, { status: 500 });
  }
}

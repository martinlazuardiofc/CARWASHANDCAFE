import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, gross_amount, payment_type } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR id = ?').get(order_id, order_id) as any;

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Midtrans/standard gateway mapping: settlement/capture -> paid, pending -> pending, deny/expire/cancel -> failed
    let mappedPaymentStatus = 'pending';
    if (['settlement', 'capture', 'paid', 'success'].includes(transaction_status?.toLowerCase())) {
      mappedPaymentStatus = 'paid';
    } else if (['expire', 'expired'].includes(transaction_status?.toLowerCase())) {
      mappedPaymentStatus = 'expired';
    } else if (['deny', 'cancel', 'failed'].includes(transaction_status?.toLowerCase())) {
      mappedPaymentStatus = 'failed';
    }

    db.prepare(`
      UPDATE orders
      SET payment_status = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(mappedPaymentStatus, order.id);

    // Record payment
    const paymentId = `pay-wh-${Date.now()}`;
    db.prepare(`
      INSERT INTO payments (id, order_id, gateway, payment_reference, amount, status, paid_at, raw_response)
      VALUES (?, ?, 'gateway_webhook', ?, ?, ?, ?, ?)
    `).run(
      paymentId,
      order.id,
      body.transaction_id || `WH-${Date.now()}`,
      Number(gross_amount || order.total),
      mappedPaymentStatus,
      mappedPaymentStatus === 'paid' ? new Date().toISOString() : null,
      JSON.stringify(body)
    );

    return NextResponse.json({ success: true, payment_status: mappedPaymentStatus });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memproses webhook pembayaran' }, { status: 500 });
  }
}

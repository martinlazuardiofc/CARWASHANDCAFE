import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateKasirWebhookSignature } from '@/lib/kasirAdapter';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-kasir-signature') || req.headers.get('x-signature');

    // In production or when cafe sets webhook signature, validate
    if (signature && !validateKasirWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Signature webhook kasir tidak valid' }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });
    }

    const { order_id, status, cashier_order_id, payment_status } = payload;
    if (!order_id) {
      return NextResponse.json({ error: 'order_id wajib disertakan' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR id = ?').get(order_id, order_id) as any;

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Map cashier status to order status if provided
    // Kasir status: RECEIVED -> diterima, PREPARING -> diproses, READY -> siap, DELIVERED -> diantar, COMPLETED -> selesai
    const statusMap: Record<string, string> = {
      'RECEIVED': 'diterima',
      'PREPARING': 'diproses',
      'READY': 'siap',
      'DELIVERED': 'diantar',
      'COMPLETED': 'selesai',
      'diterima': 'diterima',
      'diproses': 'diproses',
      'siap': 'siap',
      'diantar': 'diantar',
      'selesai': 'selesai',
    };

    const newOrderStatus = status ? statusMap[status.toUpperCase()] || statusMap[status] : null;
    const newPaymentStatus = payment_status ? payment_status.toLowerCase() : null;

    if (newOrderStatus && newOrderStatus !== order.order_status) {
      db.prepare(`
        UPDATE orders
        SET order_status = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(newOrderStatus, order.id);

      db.prepare(`
        INSERT INTO order_status_logs (id, order_id, status, changed_by)
        VALUES (?, ?, ?, 'Cashier Webhook')
      `).run(`log-${Date.now()}`, order.id, newOrderStatus);
    }

    if (newPaymentStatus && newPaymentStatus !== order.payment_status) {
      db.prepare(`
        UPDATE orders
        SET payment_status = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(newPaymentStatus, order.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook kasir berhasil diproses',
      order_id: order.order_number,
      updated_order_status: newOrderStatus || order.order_status,
      updated_payment_status: newPaymentStatus || order.payment_status,
    });
  } catch (error: any) {
    console.error('Kasir webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { order_id, method, action } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(order_id, order_id) as any;

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const payMethod = method || order.payment_method;
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const reference = `REF-${payMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // If simulating instant payment or customer completing QRIS payment
    if (action === 'simulate_success' || action === 'pay_now') {
      db.prepare(`
        INSERT INTO payments (id, order_id, gateway, payment_reference, amount, status, paid_at, raw_response)
        VALUES (?, ?, 'simulation', ?, ?, 'paid', datetime('now', 'localtime'), ?)
      `).run(paymentId, order.id, reference, order.total, JSON.stringify({ method: payMethod, note: 'Payment verified via gateway' }));

      db.prepare(`
        UPDATE orders
        SET payment_status = 'paid', payment_method = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(payMethod, order.id);

      db.prepare(`
        INSERT INTO order_status_logs (id, order_id, status, changed_by)
        VALUES (?, ?, ?, 'Payment Gateway Verified')
      `).run(`log-${Date.now()}`, order.id, order.order_status);

      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil dikonfirmasi',
        payment_status: 'paid',
        payment_reference: reference,
      });
    }

    // Default: pending payment instructions (e.g. QRIS code or VA number)
    db.prepare(`
      INSERT INTO payments (id, order_id, gateway, payment_reference, amount, status, raw_response)
      VALUES (?, ?, 'simulation', ?, ?, 'pending', ?)
    `).run(paymentId, order.id, reference, order.total, JSON.stringify({ method: payMethod }));

    let instructions: any = {};
    if (payMethod === 'qris') {
      instructions = {
        type: 'qris',
        qr_string: `00020101021226580016ID.CO.ASIALUXURYCAFE.WWW01189360091800000000000215ASIA_CAFE_${order.order_number}520458125303360540${order.total}5802ID5920ASIA CAR WASH & CAFE6007JAKARTA6304E1F4`,
        expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    } else if (payMethod === 'transfer') {
      instructions = {
        type: 'va',
        bank: 'BCA Virtual Account',
        account_number: `88019${order.order_number.replace(/[^0-9]/g, '').slice(-8)}`,
        account_name: 'ASIA CAR WASH & CAFE',
        expired_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      reference,
      method: payMethod,
      amount: order.total,
      instructions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memproses pembayaran' }, { status: 500 });
  }
}

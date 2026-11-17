import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    // Lookup by either id or order_number
    const order = db.prepare(`
      SELECT o.*, t.table_number, t.table_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.id = ? OR o.order_number = ?
    `).get(params.id, params.id) as any;

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC
    `).all(order.id) as any[];

    const statusLogs = db.prepare(`
      SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY created_at ASC
    `).all(order.id) as any[];

    const syncLogs = db.prepare(`
      SELECT * FROM kasir_sync_logs WHERE order_id = ? ORDER BY created_at DESC LIMIT 5
    `).all(order.id) as any[];

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: items.map((it) => {
          let parsedAddons = [];
          try {
            parsedAddons = JSON.parse(it.addons_snapshot || '[]');
          } catch {
            // ignore
          }
          return {
            ...it,
            addons: parsedAddons,
          };
        }),
        status_logs: statusLogs,
        kasir_sync: syncLogs[0] || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat detail pesanan' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const { order_status, payment_status } = await req.json();
    const db = getDb();

    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(params.id, params.id) as any;
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (order_status && order_status !== order.order_status) {
      db.prepare(`
        UPDATE orders
        SET order_status = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(order_status, order.id);

      db.prepare(`
        INSERT INTO order_status_logs (id, order_id, status, changed_by)
        VALUES (?, ?, ?, ?)
      `).run(`log-${Date.now()}`, order.id, order_status, `${admin.name} (${admin.role})`);

      logAudit('UPDATE_ORDER_STATUS', 'ORDER', order.id, { from: order.order_status, to: order_status }, admin);
    }

    if (payment_status && payment_status !== order.payment_status) {
      db.prepare(`
        UPDATE orders
        SET payment_status = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(payment_status, order.id);

      logAudit('UPDATE_PAYMENT_STATUS', 'ORDER', order.id, { from: order.payment_status, to: payment_status }, admin);
    }

    return NextResponse.json({ success: true, message: 'Status pesanan berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}

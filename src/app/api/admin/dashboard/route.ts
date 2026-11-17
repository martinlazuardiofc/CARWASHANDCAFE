export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const db = getDb();

    // 1. KPI Counts
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as total_orders_today,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as total_revenue_today,
        COALESCE(SUM(total), 0) as total_gross_today,
        SUM(CASE WHEN order_status = 'diterima' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN order_status = 'diproses' THEN 1 ELSE 0 END) as processing_orders,
        SUM(CASE WHEN order_status = 'siap' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN order_status = 'selesai' THEN 1 ELSE 0 END) as completed_orders
      FROM orders
      WHERE DATE(created_at) = DATE('now', 'localtime')
    `).get() as any;

    const allTimeStats = db.prepare(`
      SELECT 
        COUNT(*) as all_time_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as all_time_revenue
      FROM orders
    `).get() as any;

    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customer_accounts').get() as { count: number };

    // 2. Kasir sync failures
    const failedKasirSyncs = db.prepare(`
      SELECT COUNT(*) as count FROM kasir_sync_logs WHERE status = 'failed'
    `).get() as { count: number };

    // 3. Top selling menu items
    const topSelling = db.prepare(`
      SELECT 
        oi.product_name_snapshot as name,
        SUM(oi.quantity) as total_qty,
        SUM(oi.total) as total_amount
      FROM order_items oi
      GROUP BY oi.product_name_snapshot
      ORDER BY total_qty DESC
      LIMIT 5
    `).all() as any[];

    // 4. Revenue last 7 days
    const last7Days = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= datetime('now', '-7 days', 'localtime')
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY date ASC
    `).all() as any[];

    // 5. Revenue last 30 days
    const last30Days = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= datetime('now', '-30 days', 'localtime')
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY date ASC
    `).all() as any[];

    // 6. Recent Orders (live)
    const recentOrders = db.prepare(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT status FROM kasir_sync_logs WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as kasir_sync_status
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all() as any[];

    return NextResponse.json({
      success: true,
      kpi: {
        today_orders: todayStats.total_orders_today || 0,
        today_revenue: todayStats.total_revenue_today || 0,
        today_gross: todayStats.total_gross_today || 0,
        pending_orders: todayStats.pending_orders || 0,
        processing_orders: todayStats.processing_orders || 0,
        ready_orders: todayStats.ready_orders || 0,
        completed_orders: todayStats.completed_orders || 0,
        customer_count: customerCount.count || 0,
        failed_kasir_syncs: failedKasirSyncs.count || 0,
        all_time_orders: allTimeStats.all_time_orders || 0,
        all_time_revenue: allTimeStats.all_time_revenue || 0,
      },
      charts: {
        last7Days,
        last30Days,
        topSelling,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Gagal memuat data dashboard' }, { status: 500 });
  }
}

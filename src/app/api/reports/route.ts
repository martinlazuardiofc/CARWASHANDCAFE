export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate');     // YYYY-MM-DD
    const format = searchParams.get('format');       // 'json' | 'csv'

    let dateFilter = '';
    const params: any[] = [];
    if (startDate) {
      dateFilter += ' AND DATE(created_at) >= DATE(?)';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(created_at) <= DATE(?)';
      params.push(endDate);
    }

    // 1. Overview summary
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_gross_sales,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as total_paid_sales,
        COALESCE(AVG(total), 0) as average_order_value,
        COALESCE(SUM(discount), 0) as total_discounts_given,
        COALESCE(SUM(tax), 0) as total_tax_collected
      FROM orders
      WHERE 1=1 ${dateFilter}
    `).get(...params) as any;

    // 2. Daily breakdown
    const dailySales = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', created_at) as sale_date,
        COUNT(*) as orders_count,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY sale_date DESC
    `).all(...params) as any[];

    // 3. Top selling menu items
    const topSelling = db.prepare(`
      SELECT 
        oi.product_name_snapshot as item_name,
        SUM(oi.quantity) as qty_sold,
        SUM(oi.total) as revenue_generated
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateFilter.replace(/created_at/g, 'o.created_at')}
      GROUP BY oi.product_name_snapshot
      ORDER BY qty_sold DESC
      LIMIT 10
    `).all(...params) as any[];

    // 4. Slow moving items (items with low sales)
    const slowMoving = db.prepare(`
      SELECT 
        m.name as item_name,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as qty_sold
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      LEFT JOIN order_items oi ON m.id = oi.menu_item_id
      WHERE m.deleted_at IS NULL
      GROUP BY m.id, m.name, c.name
      ORDER BY qty_sold ASC
      LIMIT 10
    `).all() as any[];

    // 5. Payment method breakdown
    const paymentBreakdown = db.prepare(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total_amount
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY payment_method
    `).all(...params) as any[];

    // 6. Sales by table / location
    const salesByTable = db.prepare(`
      SELECT 
        location,
        COUNT(*) as orders_count,
        COALESCE(SUM(total), 0) as total_revenue
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY location
      ORDER BY total_revenue DESC
    `).all(...params) as any[];

    // If CSV export requested
    if (format === 'csv') {
      let csv = 'Order Number,Date,Customer,Location,Vehicle Plate,Payment Method,Payment Status,Order Status,Subtotal,Discount,Tax,Total\n';
      const allOrders = db.prepare(`
        SELECT order_number, created_at, customer_name, location, vehicle_plate, payment_method, payment_status, order_status, subtotal, discount, tax, total
        FROM orders
        WHERE 1=1 ${dateFilter}
        ORDER BY created_at DESC
      `).all(...params) as any[];

      for (const row of allOrders) {
        csv += `"${row.order_number}","${row.created_at}","${row.customer_name}","${row.location}","${row.vehicle_plate || ''}","${row.payment_method}","${row.payment_status}","${row.order_status}",${row.subtotal},${row.discount},${row.tax},${row.total}\n`;
      }

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="asia_cafe_report_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      summary,
      dailySales,
      topSelling,
      slowMoving,
      paymentBreakdown,
      salesByTable,
    });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Gagal memuat laporan' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentCustomer, cookieOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ authenticated: false, customer: null }, { status: 401 });
  }

  const db = getDb();
  const customerData = db.prepare('SELECT id, name, email, phone, created_at FROM customer_accounts WHERE id = ?').get(customer.customerId) as any;

  // Get recent orders by this customer
  const orders = db.prepare(`
    SELECT o.*, 
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o 
    WHERE o.customer_id = ? OR o.customer_phone = ?
    ORDER BY o.created_at DESC LIMIT 20
  `).all(customer.customerId, customerData?.phone || 'none') as any[];

  return NextResponse.json({
    authenticated: true,
    customer: customerData || customer,
    orders,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete('asia_customer_session');
  return response;
}

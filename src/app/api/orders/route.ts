import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, getCurrentCustomer, logAudit } from '@/lib/auth';
import { syncOrderToKasir } from '@/lib/kasirAdapter';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const tableId = searchParams.get('table_id');
    const date = searchParams.get('date'); // YYYY-MM-DD
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit') || 100);

    let query = `
      SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT status FROM kasir_sync_logs WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as kasir_sync_status
      FROM orders o
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` AND o.order_status = ?`;
      params.push(status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query += ` AND o.payment_status = ?`;
      params.push(paymentStatus);
    }

    if (tableId && tableId !== 'all') {
      query += ` AND (o.table_id = ? OR o.location LIKE ?)`;
      params.push(tableId, `%${tableId}%`);
    }

    if (date) {
      query += ` AND DATE(o.created_at) = DATE(?)`;
      params.push(date);
    }

    if (search && search.trim() !== '') {
      query += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` ORDER BY o.created_at DESC LIMIT ?`;
    params.push(limit);

    const orders = db.prepare(query).all(...params) as any[];

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Gagal memuat pesanan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const {
      customer_name,
      customer_phone,
      table_number,
      location,
      vehicle_plate,
      items, // array of { menu_item_id, quantity, variant_name, addon_ids, notes }
      payment_method, // 'cashier', 'qris', 'transfer', 'debit', 'credit'
      notes,
    } = body;

    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Nama pemesan dan daftar pesanan wajib diisi' }, { status: 400 });
    }

    // Resolve table or location
    let tableRecord: any = null;
    let finalLocation = location || 'Meja';
    if (table_number) {
      tableRecord = db.prepare('SELECT * FROM tables WHERE table_number = ? OR table_name = ?').get(table_number, table_number) as any;
      if (tableRecord) {
        finalLocation = tableRecord.table_name;
      }
    }

    // Get current customer if logged in
    const customer = await getCurrentCustomer();

    // Fetch tax rate setting
    const taxSetting = db.prepare("SELECT value FROM settings WHERE key = 'tax_rate'").get() as { value: string } | undefined;
    const taxRate = taxSetting ? parseFloat(taxSetting.value) || 0.11 : 0.11;

    // Backend price recalculation & snapshot preparation
    let subtotal = 0;
    let discount = 0;
    const preparedOrderItems: any[] = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM menu_items WHERE id = ? AND deleted_at IS NULL').get(item.menu_item_id) as any;
      if (!product) {
        return NextResponse.json({ error: `Produk ID ${item.menu_item_id} tidak ditemukan atau sudah tidak tersedia` }, { status: 400 });
      }

      if (!product.is_available) {
        return NextResponse.json({ error: `Produk "${product.name}" sedang habis saat ini` }, { status: 400 });
      }

      let unitPrice = product.price;

      // Handle variant price difference
      let variantSnapshot = item.variant_name || null;
      if (item.variant_name) {
        const variant = db.prepare('SELECT * FROM menu_variants WHERE menu_item_id = ? AND name = ?').get(product.id, item.variant_name) as any;
        if (variant && variant.price_difference) {
          unitPrice += variant.price_difference;
        }
      }

      // Handle add-ons price
      let addonsSnapshot: any[] = [];
      let addonsPriceTotal = 0;
      if (Array.isArray(item.addon_ids) && item.addon_ids.length > 0) {
        for (const aid of item.addon_ids) {
          const addon = db.prepare('SELECT * FROM addons WHERE id = ? AND is_active = 1').get(aid) as any;
          if (addon) {
            addonsSnapshot.push({ id: addon.id, name: addon.name, price: addon.price });
            addonsPriceTotal += addon.price;
          }
        }
      }

      const itemUnitPrice = unitPrice + addonsPriceTotal;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const itemSubtotal = itemUnitPrice * quantity;

      // Apply product discount if active
      if (product.discount_type && product.discount_value > 0) {
        if (product.discount_type === 'percentage') {
          const disc = (itemSubtotal * product.discount_value) / 100;
          discount += disc;
        } else if (product.discount_type === 'nominal') {
          discount += product.discount_value * quantity;
        }
      }

      subtotal += itemSubtotal;

      preparedOrderItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        menu_item_id: product.id,
        product_name_snapshot: product.name,
        price_snapshot: itemUnitPrice,
        quantity,
        variant_snapshot: variantSnapshot,
        addons_snapshot: JSON.stringify(addonsSnapshot),
        notes: item.notes || '',
        total: itemSubtotal,
      });
    }

    // Ensure discount does not exceed subtotal
    discount = Math.min(discount, subtotal);
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * taxRate);
    const total = taxableAmount + tax;

    // Generate unique order number: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randDigits}`;
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Initial payment status
    const initialPaymentStatus = payment_method === 'cashier' ? 'unpaid' : 'pending';

    // Insert order header
    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name, customer_phone,
        table_id, location, vehicle_plate, subtotal, discount, tax, total,
        payment_method, payment_status, order_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'diterima', ?)
    `).run(
      orderId,
      orderNumber,
      customer ? customer.customerId : null,
      customer_name.trim(),
      customer_phone ? customer_phone.trim() : null,
      tableRecord ? tableRecord.id : null,
      finalLocation,
      vehicle_plate ? vehicle_plate.trim() : null,
      subtotal,
      discount,
      tax,
      total,
      payment_method || 'cashier',
      initialPaymentStatus,
      notes || ''
    );

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, menu_item_id, product_name_snapshot, price_snapshot,
        quantity, variant_snapshot, addons_snapshot, notes, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const oi of preparedOrderItems) {
      insertItem.run(
        oi.id,
        orderId,
        oi.menu_item_id,
        oi.product_name_snapshot,
        oi.price_snapshot,
        oi.quantity,
        oi.variant_snapshot,
        oi.addons_snapshot,
        oi.notes,
        oi.total
      );
    }

    // Insert initial status log
    db.prepare(`
      INSERT INTO order_status_logs (id, order_id, status, changed_by)
      VALUES (?, ?, 'diterima', 'Customer Checkout')
    `).run(`log-${Date.now()}`, orderId);

    // Attempt cashier sync via kasirAdapter (async safe)
    syncOrderToKasir(orderId).catch((err) => {
      console.error('Auto cashier sync notice:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      order_id: orderId,
      order_number: orderNumber,
      total,
      payment_method: payment_method || 'cashier',
      payment_status: initialPaymentStatus,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat pesanan' }, { status: 500 });
  }
}

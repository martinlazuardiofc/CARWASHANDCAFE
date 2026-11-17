import { getDb } from './db';
import crypto from 'node:crypto';

export interface KasirOrderItem {
  menu_id: string;
  kasir_product_id: string;
  name: string;
  qty: number;
  price: number;
  options: string[];
  note: string;
}

export interface KasirOrderPayload {
  order_id: string;
  location: string;
  customer_name: string;
  vehicle_plate: string | null;
  created_at: string;
  items: KasirOrderItem[];
  total: number;
  payment_method: string;
  payment_status: string;
  notes: string;
}

export interface KasirConfig {
  api_url: string;
  api_key: string;
  auth_type: string;
  webhook_secret: string;
  enabled: boolean;
}

export function getKasirConfig(): KasirConfig {
  const db = getDb();
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'kasir_config'").get() as { value: string } | undefined;
  if (setting && setting.value) {
    try {
      return JSON.parse(setting.value);
    } catch {
      // fallback
    }
  }

  return {
    api_url: process.env.KASIR_API_URL || 'https://kasir.asiacafe.local/api/v1/orders',
    api_key: process.env.KASIR_API_KEY || 'kasir_sec_asia_demo_2026',
    auth_type: process.env.KASIR_AUTH_TYPE || 'Bearer',
    webhook_secret: process.env.KASIR_WEBHOOK_SECRET || 'whsec_asia_cafe_kasir_9981',
    enabled: true,
  };
}

/**
 * Builds standard Kasir payload from database order
 */
export function buildKasirPayload(orderId: string): KasirOrderPayload | null {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) return null;

  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];

  const items: KasirOrderItem[] = orderItems.map((item) => {
    let options: string[] = [];
    if (item.variant_snapshot) {
      options.push(item.variant_snapshot);
    }
    if (item.addons_snapshot) {
      try {
        const parsedAddons = JSON.parse(item.addons_snapshot);
        if (Array.isArray(parsedAddons)) {
          options.push(...parsedAddons.map((a: any) => a.name || a));
        }
      } catch {
        // ignore
      }
    }

    // Lookup menu kasir_product_id if exists
    let kasirProductId = 'SKU-GEN';
    if (item.menu_item_id) {
      const menuItem = db.prepare('SELECT kasir_product_id FROM menu_items WHERE id = ?').get(item.menu_item_id) as any;
      if (menuItem && menuItem.kasir_product_id) {
        kasirProductId = menuItem.kasir_product_id;
      }
    }

    return {
      menu_id: item.menu_item_id || 'CUSTOM',
      kasir_product_id: kasirProductId,
      name: item.product_name_snapshot,
      qty: item.quantity,
      price: item.price_snapshot,
      options,
      note: item.notes || '',
    };
  });

  return {
    order_id: order.order_number,
    location: order.location,
    customer_name: order.customer_name,
    vehicle_plate: order.vehicle_plate || null,
    created_at: order.created_at,
    items,
    total: order.total,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    notes: order.notes || '',
  };
}

/**
 * Syncs order to cashier API with idempotency and logging
 */
export async function syncOrderToKasir(orderId: string): Promise<{ success: boolean; message: string; logId?: string }> {
  const db = getDb();
  const config = getKasirConfig();

  const payload = buildKasirPayload(orderId);
  if (!payload) {
    return { success: false, message: 'Pesanan tidak ditemukan' };
  }

  const logId = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const idempotencyKey = `idemp-${orderId}-${Date.now()}`;
  const requestJson = JSON.stringify(payload);

  // Check previous log
  const existingLog = db.prepare('SELECT * FROM kasir_sync_logs WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(orderId) as any;
  const retryCount = existingLog ? (existingLog.retry_count || 0) + 1 : 0;

  // Insert initial pending sync log
  db.prepare(`
    INSERT INTO kasir_sync_logs (id, order_id, request_payload, status, retry_count, last_attempt_at)
    VALUES (?, ?, ?, 'pending', ?, datetime('now', 'localtime'))
  `).run(logId, orderId, requestJson, retryCount);

  if (!config.enabled) {
    db.prepare(`
      UPDATE kasir_sync_logs
      SET status = 'failed', error_message = 'Integrasi kasir dinonaktifkan di pengaturan', response_payload = '{}'
      WHERE id = ?
    `).run(logId);
    return { success: false, message: 'Integrasi kasir dinonaktifkan', logId };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    let responseStatus = 0;
    let responseText = '';
    let isSuccess = false;

    // In local sandbox or when cafe cashier API endpoint is mock/unreachable,
    // we handle network connection cleanly and record the realistic status
    try {
      const res = await fetch(config.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${config.auth_type} ${config.api_key}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: requestJson,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      responseStatus = res.status;
      responseText = await res.text();
      isSuccess = res.ok;
    } catch (networkErr: any) {
      clearTimeout(timeout);
      // Expected if cafe hasn't deployed external cashier server yet
      responseText = JSON.stringify({
        simulated: true,
        notice: 'Kasir endpoint sedang offline / mock standby. Pesanan tersimpan di Web Cashier/Kitchen Display.',
        error: networkErr.message || 'Connection refused or unreachable',
      });
      isSuccess = false;
    }

    const finalStatus = isSuccess ? 'synced' : 'failed';
    const errorMsg = isSuccess ? null : `HTTP ${responseStatus}: Endpoint kasir belum terhubung (${config.api_url})`;

    db.prepare(`
      UPDATE kasir_sync_logs
      SET status = ?, response_payload = ?, error_message = ?
      WHERE id = ?
    `).run(finalStatus, responseText, errorMsg, logId);

    return {
      success: isSuccess,
      message: isSuccess ? 'Pesanan berhasil disinkronkan ke web kasir' : (errorMsg || 'Gagal terhubung ke kasir'),
      logId,
    };
  } catch (err: any) {
    db.prepare(`
      UPDATE kasir_sync_logs
      SET status = 'failed', error_message = ?
      WHERE id = ?
    `).run(err.message, logId);

    return { success: false, message: err.message, logId };
  }
}

/**
 * Validates HMAC signature for incoming cashier webhooks
 */
export function validateKasirWebhookSignature(payloadRaw: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const config = getKasirConfig();
  const secret = config.webhook_secret || 'whsec_asia_cafe_kasir_9981';

  try {
    const computed = crypto.createHmac('sha256', secret).update(payloadRaw).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

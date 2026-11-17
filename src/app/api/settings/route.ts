export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireOwner, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value, description FROM settings').all() as any[];

    const settingsMap: Record<string, any> = {};
    for (const r of rows) {
      try {
        settingsMap[r.key] = JSON.parse(r.value);
      } catch {
        settingsMap[r.key] = r.value;
      }
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat pengaturan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const db = getDb();

    const insertOrUpdate = db.prepare(`
      INSERT OR REPLACE INTO settings (id, key, value, description)
      VALUES (COALESCE((SELECT id FROM settings WHERE key = ?), ?), ?, ?, '')
    `);

    for (const [k, v] of Object.entries(body)) {
      const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
      insertOrUpdate.run(k, `set-${k}`, k, valStr);
    }

    logAudit('UPDATE_SETTINGS', 'SETTINGS', 'all', body, owner);

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan pengaturan' }, { status: 403 });
  }
}

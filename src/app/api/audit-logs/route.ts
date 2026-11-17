export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireOwner } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireOwner();
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || 100);

    const logs = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Akses ditolak' }, { status: 403 });
  }
}

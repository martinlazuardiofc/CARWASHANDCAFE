import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const calls = db.prepare(`
      SELECT * FROM service_calls
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ success: true, calls });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat panggilan layanan' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const { id } = await req.json();
    const db = getDb();

    db.prepare("UPDATE service_calls SET status = 'handled' WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: 'Panggilan telah ditangani' });
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui status panggilan' }, { status: 500 });
  }
}

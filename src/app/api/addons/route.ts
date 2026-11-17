import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const addons = db.prepare('SELECT * FROM addons ORDER BY category ASC, price ASC').all();
    return NextResponse.json({ success: true, addons });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat add-ons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const { name, price, category } = await req.json();
    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nama dan harga add-on wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const id = `addon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO addons (id, name, price, category, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, name.trim(), Number(price), category || 'all');

    logAudit('CREATE', 'ADDON', id, { name, price, category }, admin);
    return NextResponse.json({ success: true, message: 'Add-on berhasil ditambahkan', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan add-on' }, { status: 500 });
  }
}

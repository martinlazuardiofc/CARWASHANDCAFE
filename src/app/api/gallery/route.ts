import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM gallery_items WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC').all();
    return NextResponse.json({ success: true, gallery: items });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat galeri' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const { title, description, image_url, category, sort_order } = await req.json();
    if (!title || !image_url) {
      return NextResponse.json({ error: 'Judul dan URL gambar wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const id = `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO gallery_items (id, title, description, image_url, category, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, title.trim(), description || '', image_url, category || 'cafe', Number(sort_order || 0));

    logAudit('CREATE', 'GALLERY', id, { title }, admin);
    return NextResponse.json({ success: true, message: 'Foto berhasil ditambahkan ke galeri', id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menambahkan galeri' }, { status: 500 });
  }
}

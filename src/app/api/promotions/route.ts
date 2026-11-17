import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = 'SELECT * FROM promotions';
    if (activeOnly) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY sort_order ASC, created_at DESC';

    const promotions = db.prepare(query).all();
    return NextResponse.json({ success: true, promotions });
  } catch {
    return NextResponse.json({ error: 'Gagal memuat promosi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const body = await req.json();
    const {
      title,
      description,
      image_url,
      discount_type,
      discount_value,
      start_at,
      end_at,
      target_type,
      target_id,
      is_active,
      sort_order,
    } = body;

    if (!title || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Judul, jenis diskon, dan nilai diskon wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const id = `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO promotions (
        id, title, description, image_url, discount_type, discount_value,
        start_at, end_at, target_type, target_id, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      description || '',
      image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
      discount_type,
      Number(discount_value),
      start_at || null,
      end_at || null,
      target_type || 'all',
      target_id || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      Number(sort_order || 0)
    );

    logAudit('CREATE', 'PROMOTION', id, { title, discount_type, discount_value }, admin);
    return NextResponse.json({ success: true, message: 'Promosi berhasil ditambahkan', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan promosi' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAudit } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const tables = db.prepare('SELECT * FROM tables ORDER BY table_type DESC, table_number ASC').all() as any[];

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    // Attach QR link and SVG/data URL
    const enriched = await Promise.all(
      tables.map(async (tbl) => {
        const qrUrl = `${baseUrl}/m/${tbl.table_number}`;
        let qrDataUrl = '';
        try {
          qrDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 320,
            margin: 2,
            color: {
              dark: '#0F2342', // Navy Dark
              light: '#FFFFFF',
            },
          });
        } catch {
          // ignore
        }

        return {
          ...tbl,
          qr_url: qrUrl,
          qr_data_url: qrDataUrl,
        };
      })
    );

    return NextResponse.json({ success: true, tables: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat meja' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const { table_number, table_name, table_type, capacity } = await req.json();
    if (!table_number || !table_name) {
      return NextResponse.json({ error: 'Nomor dan nama meja wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    // Validate uniqueness of table_number
    const existing = db.prepare('SELECT id FROM tables WHERE table_number = ?').get(table_number);
    if (existing) {
      return NextResponse.json({ error: `Meja dengan nomor ${table_number} sudah ada` }, { status: 400 });
    }

    const id = `tbl-${table_number.toLowerCase()}-${Date.now().toString(36)}`;
    const qrToken = `token-asia-tbl-${table_number.toLowerCase()}-${Date.now()}`;

    db.prepare(`
      INSERT INTO tables (id, table_number, table_name, table_type, qr_token, is_active, capacity)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(id, table_number.trim(), table_name.trim(), table_type || 'standard', qrToken, Number(capacity || 4));

    logAudit('CREATE', 'TABLE', id, { table_number, table_name }, admin);
    return NextResponse.json({ success: true, message: 'Meja berhasil ditambahkan', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan meja' }, { status: 500 });
  }
}

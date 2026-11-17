export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { table: string } }) {
  const tableParam = decodeURIComponent(params.table);
  const db = getDb();

  const table = db.prepare(`
    SELECT * FROM tables
    WHERE table_number = ? OR qr_token = ? OR id = ?
  `).get(tableParam, tableParam, tableParam) as any;

  const url = req.nextUrl.clone();
  url.pathname = '/menu';

  if (table) {
    url.search = `?table=${table.table_number}&from_qr=1`;
    const response = NextResponse.redirect(url);
    response.cookies.set('asia_table_number', table.table_number, {
      path: '/',
      maxAge: 60 * 60 * 6,
    });
    response.cookies.set('asia_table_name', table.table_name, {
      path: '/',
      maxAge: 60 * 60 * 6,
    });
    return response;
  }

  url.search = `?table=${tableParam}`;
  return NextResponse.redirect(url);
}

import { NextResponse } from 'next/server';
import { getCurrentAdmin, cookieOptions } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete('asia_admin_session');
  return response;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: admin });
}

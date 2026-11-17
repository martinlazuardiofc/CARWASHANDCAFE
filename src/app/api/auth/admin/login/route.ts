import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createAdminToken, cookieOptions, logAudit } from '@/lib/auth';

// In-memory rate limiting map: ip -> { count, lockedUntil }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const now = Date.now();

    const rate = loginAttempts.get(ip);
    if (rate && rate.lockedUntil > now) {
      const waitMins = Math.ceil((rate.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Akun terkunci sementara selama ${waitMins} menit.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      // Record failed attempt
      const current = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 5) {
        current.lockedUntil = now + 15 * 60 * 1000; // 15 mins lock
      }
      loginAttempts.set(ip, current);

      return NextResponse.json(
        { error: 'Email atau password administrator salah' },
        { status: 401 }
      );
    }

    // Success - reset attempts
    loginAttempts.delete(ip);

    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'OWNER' | 'STAFF',
    };

    const token = await createAdminToken(payload);

    logAudit('LOGIN', 'USER', user.id, { message: 'Administrator login successful', role: user.role }, payload);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: payload,
    });

    response.cookies.set('asia_admin_session', token, cookieOptions);
    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

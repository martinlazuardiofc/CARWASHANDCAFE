import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createCustomerToken, cookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const customer = db.prepare('SELECT * FROM customer_accounts WHERE email = ?').get(email.trim().toLowerCase()) as any;

    if (!customer || !bcrypt.compareSync(password, customer.password_hash)) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const payload = {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    };

    const token = await createCustomerToken(payload);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      customer: payload,
    });

    response.cookies.set('asia_customer_session', token, cookieOptions);
    return response;
  } catch (err: any) {
    console.error('Customer login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

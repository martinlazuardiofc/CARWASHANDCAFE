import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createCustomerToken, cookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const db = getDb();
    const cleanEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM customer_accounts WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 400 });
    }

    const id = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO customer_accounts (id, name, email, phone, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), cleanEmail, phone ? phone.trim() : null, passHash);

    const payload = {
      customerId: id,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
    };

    const token = await createCustomerToken(payload);

    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      customer: payload,
    });

    response.cookies.set('asia_customer_session', token, cookieOptions);
    return response;
  } catch (err: any) {
    console.error('Customer register error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan saat pendaftaran' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { requireOwner, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    await requireOwner();
    const db = getDb();
    const staff = db.prepare('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at ASC').all();
    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Akses ditolak' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const owner = await requireOwner();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }

    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), cleanEmail, passHash, role === 'OWNER' ? 'OWNER' : 'STAFF');

    logAudit('CREATE_STAFF', 'USER', id, { name, email: cleanEmail, role }, owner);

    return NextResponse.json({ success: true, message: 'Akun staff berhasil dibuat', id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membuat akun staff' }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const owner = await requireOwner();
    const { id, name, email, password, role } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib disertakan' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    let passHash = existing.password_hash;
    if (password && password.trim() !== '') {
      passHash = bcrypt.hashSync(password.trim(), 10);
    }

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          password_hash = ?,
          role = COALESCE(?, role),
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      passHash,
      role || null,
      id
    );

    logAudit('UPDATE_STAFF', 'USER', id, { name, role }, owner);

    return NextResponse.json({ success: true, message: 'Data staff berhasil diperbarui' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui staff' }, { status: 403 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const owner = await requireOwner();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib disertakan' }, { status: 400 });
    }

    // Do not allow deleting own account or the main owner
    if (id === owner.userId) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    logAudit('DELETE_STAFF', 'USER', id, {}, owner);

    return NextResponse.json({ success: true, message: 'Akun staff berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghapus staff' }, { status: 403 });
  }
}

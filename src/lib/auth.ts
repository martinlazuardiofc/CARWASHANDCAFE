import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super_secret_asia_carwash_cafe_luxury_session_key_2026'
);

const ADMIN_COOKIE_NAME = 'asia_admin_session';
const CUSTOMER_COOKIE_NAME = 'asia_customer_session';

export interface AdminPayload {
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'STAFF';
}

export interface CustomerPayload {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
}

// ---------------- Admin Auth ---------------- //

export async function createAdminToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export async function requireOwner(): Promise<AdminPayload> {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== 'OWNER') {
    throw new Error('UNAUTHORIZED_OWNER_REQUIRED');
  }
  return admin;
}

export async function requireAdmin(): Promise<AdminPayload> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error('UNAUTHORIZED_ADMIN_REQUIRED');
  }
  return admin;
}

// ---------------- Customer Auth ---------------- //

export async function createCustomerToken(payload: CustomerPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyCustomerToken(token: string): Promise<CustomerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CustomerPayload;
  } catch {
    return null;
  }
}

export async function getCurrentCustomer(): Promise<CustomerPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyCustomerToken(token);
}

// ---------------- Audit Logger ---------------- //

export function logAudit(
  action: string,
  entity: string,
  entityId: string | null,
  changes: Record<string, unknown> | string,
  admin?: AdminPayload | null
) {
  try {
    const db = getDb();
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const changeStr = typeof changes === 'string' ? changes : JSON.stringify(changes);
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, entity, entity_id, changes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      admin ? admin.userId : 'system',
      admin ? `${admin.name} (${admin.role})` : 'System/Customer',
      action,
      entity,
      entityId || 'none',
      changeStr
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// Helper for cookie options
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

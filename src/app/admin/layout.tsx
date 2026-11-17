import React from 'react';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('asia_admin_session')?.value;
  let adminUser = null;

  if (token) {
    adminUser = await verifyAdminToken(token);
  }

  return (
    <div className="min-h-screen bg-navy-dark text-cream flex">
      {/* Sidebar */}
      <AdminSidebar user={adminUser} />

      {/* Main Admin Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}

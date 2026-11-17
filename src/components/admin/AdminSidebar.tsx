'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  QrCode,
  Tag,
  Image as ImageIcon,
  BarChart3,
  Users,
  UserCog,
  Settings,
  PlugZap,
  ShieldCheck,
  Tv,
  LogOut,
  Menu,
  X,
  Instagram,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  user?: any;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Do not render sidebar on login page
  if (pathname === '/admin/login') {
    return null;
  }

  const isOwner = user?.role === 'OWNER';

  const navLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Kitchen Display', href: '/admin/kitchen-display', icon: Tv },
    { label: 'Produk Menu', href: '/admin/products', icon: UtensilsCrossed },
    { label: 'Kategori Menu', href: '/admin/categories', icon: Layers },
    { label: 'Meja & QR Code', href: '/admin/tables', icon: QrCode },
    { label: 'Promosi & Banner', href: '/admin/promotions', icon: Tag },
    { label: 'Galeri Foto', href: '/admin/gallery', icon: ImageIcon },
    { label: 'Laporan Penjualan', href: '/admin/reports', icon: BarChart3 },
    { label: 'Data Pelanggan', href: '/admin/customers', icon: Users },
    ...(isOwner
      ? [
          { label: 'Staff & Akun', href: '/admin/staff', icon: UserCog },
          { label: 'Integrasi Kasir', href: '/admin/integrations', icon: PlugZap },
          { label: 'Pengaturan Bisnis', href: '/admin/settings', icon: Settings },
          { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Top Navigation Toggle */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-navy-deep/95 backdrop-blur-md border-b border-gold/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AsiaLogo size="sm" variant="gold" />
          <span className="text-xs font-bold text-gold tracking-widest uppercase">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl border border-gold/30 text-gold"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-navy-deep/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Responsive Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-deep border-r border-gold/20 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-gold/20 flex flex-col items-center text-center">
            <AsiaLogo size="md" variant="gold" />
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold tracking-widest uppercase border border-gold/30">
              <span>{user?.role || 'ADMIN'} PANEL</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-gold/20 to-gold/5 text-gold border-l-2 border-gold shadow-sm font-bold'
                      : 'text-cream/70 hover:text-cream hover:bg-navy-dark'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-cream/50'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Business Social & External Links (Section 7) */}
          <div className="p-3 border-t border-gold/15 bg-navy-dark/40 space-y-1.5">
            <a
              href="https://instagram.com/asiacarwashandcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-cream/70 hover:text-gold hover:bg-navy-dark transition-colors"
            >
              <div className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-gold" />
                <span>@asiacarwashandcafe</span>
              </div>
              <ExternalLink className="w-3 h-3 text-cream/40" />
            </a>

            <a
              href="https://maps.app.goo.gl/1BwPD4VX9QfCVcxq7?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-cream/70 hover:text-gold hover:bg-navy-dark transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Buka Google Maps</span>
              </div>
              <ExternalLink className="w-3 h-3 text-cream/40" />
            </a>
          </div>

          {/* User info & Logout */}
          <div className="p-3.5 border-t border-gold/20 bg-navy-dark flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-cream truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gold/80">{user?.role || 'Staff'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-cream/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

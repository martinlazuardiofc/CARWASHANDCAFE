'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import {
  User,
  Phone,
  Mail,
  Receipt,
  LogOut,
  ChevronRight,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/auth/customer/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          if (data.orders) setOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/customer/logout', { method: 'POST' });
    setCustomer(null);
    setOrders([]);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-navy text-cream pb-24 px-4 pt-6">
      <div className="max-w-md mx-auto space-y-5">
        <header className="flex items-center justify-between pb-3 border-b border-gold/20">
          <Link href="/">
            <AsiaLogo size="sm" variant="gold" />
          </Link>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Akun Pelanggan
          </span>
        </header>

        {loading ? (
          <div className="p-8 text-center text-xs text-cream/60">Memuat profil...</div>
        ) : customer ? (
          <div className="space-y-4">
            {/* Profile Info Card */}
            <div className="p-4 rounded-2xl border border-gold/30 bg-navy-dark space-y-3 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center font-serif font-bold text-lg">
                  {customer.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-cream">
                    {customer.name}
                  </h2>
                  <p className="text-xs text-gold flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>ASIA Cafe Member</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gold/15 space-y-1.5 text-xs text-cream/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-2 py-2 px-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout dari Akun</span>
              </button>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-2">
                <Receipt className="w-4 h-4 text-gold" />
                <span>Riwayat Pemesanan Anda</span>
              </h3>

              {orders.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border border-gold/20 bg-navy-dark/40 text-xs text-cream/60">
                  Belum ada riwayat pesanan.
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((ord) => (
                    <Link
                      key={ord.id}
                      href={`/orders/${ord.id}`}
                      className="p-3.5 rounded-2xl border border-gold/20 bg-navy-dark hover:border-gold/40 flex items-center justify-between transition-all block"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gold">
                            {ord.order_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              ord.order_status === 'selesai'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gold/20 text-gold'
                            }`}
                          >
                            {ord.order_status}
                          </span>
                        </div>
                        <p className="text-[11px] text-cream/70 mt-1">
                          {ord.location} &bull; {ord.item_count} Menu
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-xs text-cream">
                          Rp {ord.total?.toLocaleString('id-ID')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gold ml-auto mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl border border-gold/30 bg-navy-dark text-center space-y-4 shadow-luxury">
            <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
              <User className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif font-bold text-lg text-cream">
                Akun Pelanggan (Opsional)
              </h2>
              <p className="text-xs text-cream/70 max-w-xs mx-auto">
                Anda dapat memesan makanan dan minuman sebagai guest tanpa login. Masuk atau daftar untuk menyimpan riwayat pesanan Anda.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href="/login"
                className="w-full py-3.5 px-4 rounded-xl bg-gold text-navy-deep font-bold text-xs uppercase tracking-wider shadow-goldGlow block text-center"
              >
                Login Akun Pelanggan
              </Link>
              <Link
                href="/register"
                className="w-full py-3 px-4 rounded-xl border border-gold/40 text-gold hover:bg-gold/10 font-bold text-xs uppercase tracking-wider block text-center"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        )}
      </div>

      <CustomerBottomNav />
    </div>
  );
}

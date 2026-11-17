'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import { Search, Clock, ArrowRight, AlertCircle, FileText } from 'lucide-react';

export default function OrderTrackPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) {
      setErrorMsg('Masukkan nomor pesanan Anda');
      return;
    }
    router.push(`/orders/${orderQuery.trim()}`);
  };

  return (
    <div className="min-h-screen bg-navy text-cream pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <AsiaLogo size="md" variant="gold" />
          <h1 className="font-serif font-bold text-xl text-cream tracking-wide">
            Lacak Pesanan Anda
          </h1>
          <p className="text-xs text-cream/70 max-w-xs mx-auto">
            Pantau status pesanan makanan &amp; minuman Anda secara real-time langsung dari meja cafe.
          </p>
        </div>

        <form onSubmit={handleSearch} className="p-4 rounded-2xl border border-gold/30 bg-navy-dark space-y-3 shadow-card">
          <label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gold" />
            <span>Cari Nomor Pesanan</span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => {
                setOrderQuery(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: ORD-20261117-1234"
              className="w-full p-3 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold uppercase"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Cari Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4">
          <Link href="/menu" className="text-xs text-gold hover:underline">
            &larr; Kembali ke Menu Cafe
          </Link>
        </div>
      </div>

      <CustomerBottomNav />
    </div>
  );
}

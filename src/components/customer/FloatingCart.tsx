'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function FloatingCart() {
  const pathname = usePathname();
  const { itemCount, subtotal, finalTotal } = useCart();

  // Hide on cart, checkout, payment, admin, and order detail pages
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/orders/')
  ) {
    return null;
  }

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 z-30 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <Link
          href="/cart"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans shadow-luxury hover:brightness-105 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-navy-deep/20 p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-navy-deep" />
              <span className="absolute -top-1 -right-1 bg-navy-deep text-gold text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-navy-deep/80 leading-none">
                {itemCount} Menu Dipilih
              </p>
              <p className="text-base font-extrabold text-navy-deep tracking-tight mt-0.5">
                Rp {finalTotal.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider bg-navy-deep text-gold px-3.5 py-2 rounded-xl shadow-sm">
            <span>Lihat Keranjang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}

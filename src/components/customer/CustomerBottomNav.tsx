'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, Clock, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CustomerBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { label: 'Keranjang', href: '/cart', icon: ShoppingBag, badge: itemCount },
    { label: 'Status', href: '/orders/track', icon: Clock },
    { label: 'Akun', href: '/account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-navy-deep/95 backdrop-blur-md border-t border-gold/25 py-2 px-3 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive ? 'text-gold scale-105' : 'text-cream/60 hover:text-cream'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-1.5'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-gold to-gold-dark text-navy-deep text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'text-gold font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 bg-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

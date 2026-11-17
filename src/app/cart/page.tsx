'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  QrCode,
  Tag,
  Receipt,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    tableNumber,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountTotal,
    taxTotal,
    finalTotal,
    itemCount,
  } = useCart();

  return (
    <div className="min-h-screen bg-navy text-cream pb-24 relative overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy-deep/95 backdrop-blur-md border-b border-gold/20 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full border border-gold/25 text-gold hover:bg-gold/15"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h1 className="font-serif font-bold text-base text-cream">
            Keranjang Pesanan
          </h1>

          {items.length > 0 ? (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Hapus Semua
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Table Notification */}
        {tableNumber ? (
          <div className="p-3 rounded-2xl border border-gold/30 bg-gold/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-gold" />
              <span className="text-xs font-bold text-cream">
                Pesanan untuk Meja {tableNumber}
              </span>
            </div>
            <Link href="/menu" className="text-[11px] text-gold underline">
              Ubah
            </Link>
          </div>
        ) : (
          <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
            <span className="text-xs text-amber-300">
              Belum memilih nomor meja.
            </span>
            <Link href="/checkout" className="text-xs font-bold text-gold underline">
              Pilih di Checkout
            </Link>
          </div>
        )}

        {/* Cart Item List */}
        {items.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-navy-dark border border-gold/30 flex items-center justify-center mx-auto text-gold">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-lg text-cream">
                Keranjang Masih Kosong
              </h2>
              <p className="text-xs text-cream/60 max-w-xs mx-auto">
                Silakan jelajahi menu makanan, kopi, dan mocktail premium kami.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 py-3 px-6 rounded-xl bg-gold text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-110 transition-all"
            >
              <span>Mulai Pesan Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-cream/70">
              <span>{itemCount} Produk Terpilih</span>
              <Link href="/menu" className="text-gold font-semibold flex items-center gap-1">
                <span>+ Tambah Menu Lain</span>
              </Link>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => {
                const addonsPrice = item.addons.reduce((sum, a) => sum + a.price, 0);
                const unitPrice = item.price + (item.variantPriceDiff || 0) + addonsPrice;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl border border-gold/20 bg-navy-dark shadow-card space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-navy-deep flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-sm text-cream truncate">
                          {item.name}
                        </h4>

                        {/* Modifiers tags */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.variant && (
                            <span className="px-2 py-0.5 rounded-md bg-gold/15 text-gold text-[10px] font-semibold border border-gold/30">
                              {item.variant}
                            </span>
                          )}
                          {item.addons.map((a) => (
                            <span
                              key={a.id}
                              className="px-2 py-0.5 rounded-md bg-navy-deep text-cream/80 text-[10px] border border-gold/20"
                            >
                              +{a.name}
                            </span>
                          ))}
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-cream/60 italic mt-1 line-clamp-1">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="p-1.5 text-cream/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price and Quantity Controller */}
                    <div className="flex items-center justify-between pt-2 border-t border-gold/15">
                      <span className="font-extrabold text-sm text-gold">
                        Rp {itemTotal.toLocaleString('id-ID')}
                      </span>

                      <div className="flex items-center border border-gold/30 rounded-xl bg-navy-deep px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-gold hover:text-gold-light active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 font-bold text-xs text-cream min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-gold hover:text-gold-light active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary Card (Section 12 Rules) */}
            <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-2.5">
              <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-1.5 pb-2 border-b border-gold/15">
                <Receipt className="w-4 h-4 text-gold" />
                <span>Rincian Pembayaran</span>
              </h3>

              <div className="space-y-1.5 text-xs text-cream/80">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} item)</span>
                  <span className="font-medium text-cream">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Diskon Promosi</span>
                    <span>- Rp {discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Pajak &amp; Layanan (11%)</span>
                  <span className="font-medium text-cream">
                    Rp {taxTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-2 border-t border-gold/20 flex justify-between items-baseline font-bold text-sm text-gold">
                  <span className="uppercase tracking-wider">Total Akhir</span>
                  <span className="text-base text-gold">
                    Rp {finalTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-between"
            >
              <span>Lanjut ke Checkout</span>
              <div className="flex items-center gap-1.5 font-extrabold text-sm">
                <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        )}
      </main>

      {/* Customer Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
}

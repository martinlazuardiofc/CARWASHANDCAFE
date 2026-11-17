'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AsiaLogo from '@/components/brand/AsiaLogo';
import HeroIntroAnimation from '@/components/brand/HeroIntroAnimation';
import FloatingCart from '@/components/customer/FloatingCart';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import ProductDetailSheet from '@/components/customer/ProductDetailSheet';
import {
  Sparkles,
  MapPin,
  Instagram,
  Clock,
  Car,
  Coffee,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Star,
  QrCode,
  Flame,
} from 'lucide-react';

export default function CustomerHomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('');

  useEffect(() => {
    // Check saved table from cookie or localStorage
    const savedTbl = localStorage.getItem('asia_table_number');
    if (savedTbl) setTableNumber(savedTbl);

    // Fetch initial data
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories.slice(0, 10));
      })
      .catch(() => {});

    fetch('/api/products?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setFeaturedProducts(data.products.slice(0, 8));
      })
      .catch(() => {});

    fetch('/api/promotions?activeOnly=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.promotions) setPromotions(data.promotions);
      })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const openProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-navy text-cream pb-24 relative overflow-x-hidden">
      {/* Opening Intro Animation for first-time visits */}
      <HeroIntroAnimation />

      {/* Top Brand Bar */}
      <header className="sticky top-0 z-30 bg-navy-deep/90 backdrop-blur-md border-b border-gold/20 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AsiaLogo size="sm" variant="gold" />
          </Link>

          {tableNumber ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-bold tracking-wider">
              <QrCode className="w-3.5 h-3.5" />
              <span>Meja {tableNumber}</span>
            </div>
          ) : (
            <Link
              href="/menu"
              className="text-xs font-semibold text-gold hover:text-gold-light border border-gold/30 px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              <span>Buka Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content (Mobile First) */}
      <main className="max-w-md mx-auto px-4 space-y-6 pt-3">
        {/* Important Announcement from Administrator (Section 9 & 4.A) */}
        {settings.announcement_active === '1' && (
          <div className="p-4 rounded-2xl border border-gold/40 bg-gradient-to-r from-coffee-dark/80 to-navy-dark/90 shadow-card relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gold/20 text-gold flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs uppercase tracking-wider font-bold text-gold font-sans">
                  {settings.announcement_title || 'Informasi Penting'}
                </h4>
                <p className="text-xs text-cream/90 mt-1 leading-relaxed">
                  {settings.announcement_text ||
                    'Selamat datang di ASIA Car Wash & Cafe. Nikmati santapan cafe Eropa premium sembari kendaraan Anda dimanjakan dengan car wash detailing terbaik.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-gold/30 shadow-luxury h-64 flex flex-col justify-end p-5">
          <Image
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80"
            alt="ASIA Cafe Atmosphere"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Car className="w-3 h-3" />
              <span>Automotive Lounge &amp; Cafe</span>
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-cream leading-tight">
              A Taste of Comfort, <br />
              <span className="text-gold italic font-normal">A Touch of Luxury.</span>
            </h1>
            <p className="text-xs text-cream/80 line-clamp-2">
              European Luxury Cafe meets Modern Automotive Lounge. Pesan menu langsung dari meja Anda.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/menu"
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Lihat Menu Digital</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Active Promotions Carousel / Cards */}
        {promotions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gold flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Promosi Eksklusif</span>
              </h3>
              <span className="text-[10px] text-cream/50 uppercase">Penawaran Terbatas</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="min-w-[280px] max-w-[280px] rounded-2xl border border-gold/25 bg-navy-dark overflow-hidden flex-shrink-0 snap-start shadow-card flex flex-col"
                >
                  <div className="relative h-28 w-full bg-navy-deep">
                    <Image
                      src={promo.image_url}
                      alt={promo.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-gold text-navy-deep text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {promo.discount_type === 'percentage'
                        ? `Hemat ${promo.discount_value}%`
                        : `Diskon Rp ${Number(promo.discount_value).toLocaleString('id-ID')}`}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-cream line-clamp-1">
                        {promo.title}
                      </h4>
                      <p className="text-[11px] text-cream/70 line-clamp-2 mt-1">
                        {promo.description}
                      </p>
                    </div>
                    <Link
                      href="/menu"
                      className="mt-2 text-[11px] text-gold font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Pesan Menu Promo</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Unggulan (Featured Items) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-cream tracking-wide">
                Menu Unggulan
              </h2>
              <p className="text-xs text-gold/80 italic font-serif">
                Pilihan favorit chef &amp; barista ASIA
              </p>
            </div>
            <Link
              href="/menu"
              className="text-xs text-gold font-semibold flex items-center gap-1 hover:text-gold-light"
            >
              <span>Semua Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => openProduct(product)}
                className="min-w-[210px] max-w-[210px] rounded-2xl border border-gold/25 bg-navy-dark overflow-hidden flex-shrink-0 snap-start shadow-card flex flex-col cursor-pointer group active:scale-98 transition-all"
              >
                <div className="relative h-32 w-full bg-navy-deep overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-70" />

                  {product.label && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold text-navy-deep shadow-sm">
                      {product.label}
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                      {product.category_name}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-cream line-clamp-1 mt-0.5">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-cream/70 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gold/15">
                    <span className="font-bold text-xs text-gold">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <button className="text-[10px] font-bold text-navy-deep bg-gold px-2.5 py-1 rounded-lg uppercase tracking-wider hover:brightness-110">
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Shortcuts */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gold font-sans">
            Jelajahi Kategori
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="p-3 rounded-xl border border-gold/20 bg-navy-dark hover:border-gold/40 hover:bg-gold/10 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-serif font-bold text-xs text-cream group-hover:text-gold transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-cream/50">
                    {cat.product_count} Menu
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gold/60 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Car Wash Services & Lounge Info */}
        <div className="p-4 rounded-2xl border border-gold/30 bg-gradient-to-br from-coffee-dark/40 via-navy-dark to-navy-deep space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gold/15 text-gold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-cream">
                Layanan Car Wash &amp; Auto Detailing
              </h3>
              <p className="text-[11px] text-gold">
                Jam Operasional: {settings.carwash_hours || '07:30 - 19:00 WIB'}
              </p>
            </div>
          </div>

          <p className="text-xs text-cream/80 leading-relaxed">
            {settings.carwash_info ||
              'Layanan Car Wash Kami: Snow Wash Hidrolik, Interior Vacuum & Disinfection, Glass Water-Spot Treatment, dan Express Body Waxing.'}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-cream/70 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>pH Neutral Snow Shampoo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Hydraulic Underbody Wash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Comfort VIP Lounge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>High-Speed Wifi &amp; AC</span>
            </div>
          </div>
        </div>

        {/* Cafe Operating Hours & Location */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-cream uppercase tracking-wider font-sans">
              Jam Operasional Cafe: {settings.cafe_hours || '08:00 - 22:00 WIB'}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-cream/80 border-t border-gold/15 pt-2.5">
            <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">ASIA Car Wash &amp; Cafe</p>
              <p className="text-[11px] text-cream/60 mt-0.5">
                Modern Automotive Lounge &amp; European Dining
              </p>
            </div>
          </div>

          {/* Action buttons: Google Maps & Instagram */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://maps.app.goo.gl/1BwPD4VX9QfCVcxq7?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl border border-gold/30 bg-navy-deep text-gold text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gold/15 active:scale-95 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>

            <a
              href="https://instagram.com/asiacarwashandcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl border border-gold/30 bg-navy-deep text-gold text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gold/15 active:scale-95 transition-all"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@asiacarwashandcafe</span>
            </a>
          </div>
        </div>

        {/* Footer Brand Note */}
        <footer className="text-center py-6 border-t border-gold/15 text-cream/50 space-y-2">
          <AsiaLogo size="sm" variant="gold" />
          <p className="text-[11px] italic font-serif">
            A Taste of Comfort, A Touch of Luxury.
          </p>
          <p className="text-[10px]">
            &copy; 2026 ASIA Car Wash &amp; Cafe. All rights reserved.
          </p>
        </footer>
      </main>

      {/* Floating Cart Button */}
      <FloatingCart />

      {/* Customer Bottom Navigation */}
      <CustomerBottomNav />

      {/* Product Detail Modal */}
      <ProductDetailSheet
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}

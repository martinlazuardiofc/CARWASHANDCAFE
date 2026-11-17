'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import FloatingCart from '@/components/customer/FloatingCart';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import ProductDetailSheet from '@/components/customer/ProductDetailSheet';
import {
  Search,
  Filter,
  Star,
  Flame,
  Sparkles,
  ChevronDown,
  X,
  SlidersHorizontal,
  QrCode,
  Tag,
  Loader2,
} from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const tableParam = searchParams.get('table');

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('all'); // all, under30k, 30to50k, above50k
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (tableParam) {
      setTableNumber(tableParam);
      localStorage.setItem('asia_table_number', tableParam);
    } else {
      const saved = localStorage.getItem('asia_table_number');
      if (saved) setTableNumber(saved);
    }

    // Fetch categories and products
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([catData, prodData]) => {
        if (catData.categories) setCategories(catData.categories);
        if (prodData.products) setProducts(prodData.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Menu load error:', err);
        setLoading(false);
      });
  }, [tableParam]);

  // Featured items for top carousel
  const featuredItems = useMemo(() => {
    return products.filter((p) => p.is_featured === 1);
  }, [products]);

  // Filtered menu items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (p.category_slug !== activeCategory && p.category_id !== activeCategory) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description && p.description.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      // Price filter
      if (priceFilter === 'under30k' && p.price >= 30000) return false;
      if (priceFilter === '30to50k' && (p.price < 30000 || p.price > 50000)) return false;
      if (priceFilter === 'above50k' && p.price <= 50000) return false;

      // Label filter
      if (labelFilter !== 'all') {
        if (p.label !== labelFilter) return false;
      }

      return true;
    });
  }, [products, activeCategory, searchQuery, priceFilter, labelFilter]);

  const openProduct = (p: any) => {
    setSelectedProduct(p);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-navy text-cream pb-24 relative overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy-deep/95 backdrop-blur-md border-b border-gold/20 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AsiaLogo size="sm" variant="gold" />
          </Link>

          <div className="flex items-center gap-2">
            {tableNumber && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-bold">
                <QrCode className="w-3.5 h-3.5" />
                <span>Meja {tableNumber}</span>
              </div>
            )}
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2 rounded-xl border border-gold/30 bg-navy-dark text-gold hover:bg-gold/15 active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="max-w-md mx-auto mt-2 relative">
          <Search className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu kopi, rice bowl, steak, snack..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-navy-dark/90 border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 hover:text-gold"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sticky Category Navigation */}
        <div className="max-w-md mx-auto mt-2.5 overflow-x-auto scrollbar-none flex gap-1.5 pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-gold text-navy-deep font-bold shadow-sm'
                : 'bg-navy-dark text-cream/70 border border-gold/20 hover:text-cream'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? 'bg-gold text-navy-deep font-bold shadow-sm'
                  : 'bg-navy-dark text-cream/70 border border-gold/20 hover:text-cream'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-6">
        {/* Top Carousel: Featured Menu (Kartu Besar) */}
        {activeCategory === 'all' && !searchQuery && featuredItems.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gold font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Menu Unggulan ASIA</span>
              </h2>
              <span className="text-[10px] text-cream/50">Chef Recommended</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openProduct(item)}
                  className="min-w-[260px] max-w-[260px] rounded-2xl border border-gold/30 bg-navy-dark overflow-hidden flex-shrink-0 snap-start shadow-card cursor-pointer group active:scale-98 transition-all flex flex-col"
                >
                  <div className="relative h-36 w-full bg-navy-deep">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-60" />

                    {item.label && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold text-navy-deep shadow-sm">
                        {item.label}
                      </span>
                    )}

                    {item.is_draft === 1 && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-amber-500 text-navy-deep">
                        Draft/Konfirmasi
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">
                        {item.category_name}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-cream line-clamp-1 mt-0.5">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-cream/70 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gold/15 flex items-center justify-between">
                      <span className="font-extrabold text-sm text-gold">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <button className="text-[10px] font-bold text-navy-deep bg-gold px-3 py-1.5 rounded-lg uppercase tracking-wider hover:brightness-110">
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Menu List (Daftar Produk Rapi) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-cream tracking-wide">
              {activeCategory === 'all'
                ? 'Daftar Menu'
                : categories.find((c) => c.slug === activeCategory)?.name || 'Menu'}
            </h2>
            <span className="text-xs text-cream/50">
              {filteredProducts.length} Produk
            </span>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-navy-dark/60 border border-gold/10 animate-pulse flex items-center p-3 gap-3"
                >
                  <div className="w-20 h-20 rounded-xl bg-navy-deep" />
                  <div className="flex-1 space-y-2">
                    <div className="w-1/3 h-3 bg-navy-deep rounded" />
                    <div className="w-2/3 h-4 bg-navy-deep rounded" />
                    <div className="w-1/4 h-3 bg-navy-deep rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-gold/20 bg-navy-dark/40 space-y-2">
              <p className="text-sm font-serif font-semibold text-cream">
                Tidak ada menu yang sesuai
              </p>
              <p className="text-xs text-cream/60">
                Coba ubah kata kunci pencarian atau filter kategori Anda.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setPriceFilter('all');
                  setLabelFilter('all');
                }}
                className="mt-2 text-xs text-gold font-bold underline"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProducts.map((product) => {
                const isUnavailable = product.is_available === 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isUnavailable && openProduct(product)}
                    className={`p-3 rounded-2xl border border-gold/20 bg-navy-dark shadow-card flex items-center justify-between gap-3.5 transition-all ${
                      isUnavailable
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer hover:border-gold/40 active:scale-98'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-navy-deep flex-shrink-0">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-navy-deep/80 flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-wider">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] uppercase tracking-wider text-gold font-bold">
                          {product.category_name}
                        </span>
                        {product.label && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-gold/20 text-gold border border-gold/30 uppercase">
                            {product.label}
                          </span>
                        )}
                        {product.is_draft === 1 && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                            Perlu Konfirmasi
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm text-cream truncate mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-cream/70 line-clamp-1 mt-0.5">
                        {product.description}
                      </p>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-xs text-gold">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {product.discount_type && product.discount_value > 0 && (
                          <span className="text-[10px] text-cream/40 line-through">
                            Rp {(product.price * 1.15).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add action */}
                    {!isUnavailable && (
                      <button className="p-2 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-navy-deep transition-all flex-shrink-0">
                        <span className="text-xs font-bold px-1">+</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Filter Bottom Sheet Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-deep/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-sm bg-navy-dark border border-gold/30 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-cream animate-fade-up">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3">
              <h3 className="font-serif font-bold text-base text-cream">
                Filter Menu
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 text-gold hover:text-gold-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gold">
                Rentang Harga
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: 'Semua Harga' },
                  { id: 'under30k', label: '< Rp 30.000' },
                  { id: '30to50k', label: 'Rp 30.000 - Rp 50.000' },
                  { id: 'above50k', label: '> Rp 50.000' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPriceFilter(item.id)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      priceFilter === item.id
                        ? 'border-gold bg-gold/20 text-gold'
                        : 'border-gold/20 bg-navy-deep/30 text-cream/70'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Label Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gold">
                Label Khusus
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'Best Seller', label: 'Best Seller' },
                  { id: 'Recommended', label: 'Recommended' },
                  { id: 'Spicy', label: 'Spicy' },
                  { id: 'New', label: 'New' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLabelFilter(item.id)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      labelFilter === item.id
                        ? 'border-gold bg-gold/20 text-gold'
                        : 'border-gold/20 bg-navy-deep/30 text-cream/70'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setPriceFilter('all');
                  setLabelFilter('all');
                  setShowFilterModal(false);
                }}
                className="w-1/2 py-3 rounded-xl border border-gold/30 text-xs font-bold uppercase text-cream/80 hover:bg-gold/10"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-1/2 py-3 rounded-xl bg-gold text-navy-deep text-xs font-bold uppercase shadow-goldGlow"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart & Bottom Nav */}
      <FloatingCart />
      <CustomerBottomNav />

      {/* Product Detail Bottom Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}

export default function DigitalMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy text-cream flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check, Flame, Star, Sparkles } from 'lucide-react';
import { useCart, CartAddon } from '@/context/CartContext';

interface ProductDetailProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailSheet({ product, isOpen, onClose }: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      // Default variant if exists
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].name);
      } else {
        setSelectedVariant('');
      }
      setSelectedAddons([]);
      setNotes('');
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Calculate unit price based on variant and addons
  let variantPriceDiff = 0;
  if (selectedVariant && product.variants) {
    const v = product.variants.find((item: any) => item.name === selectedVariant);
    if (v) variantPriceDiff = v.price_difference || 0;
  }

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = product.price + variantPriceDiff + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
      }
    });
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      category: product.category_name || '',
      variant: selectedVariant || undefined,
      variantPriceDiff,
      addons: selectedAddons,
      notes: notes.trim() || undefined,
      quantity,
      discountType: product.discount_type,
      discountValue: product.discount_value,
    });

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-deep/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-navy-dark border border-gold/30 rounded-t-3xl sm:rounded-3xl shadow-luxury max-h-[92vh] flex flex-col overflow-hidden animate-fade-up relative text-cream"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close */}
        <div className="relative h-60 w-full bg-navy-deep flex-shrink-0">
          <Image
            src={product.image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-navy-deep/70 backdrop-blur-md text-gold p-2 rounded-full border border-gold/30 hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
            {product.label && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold text-navy-deep flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-navy-deep" />
                {product.label}
              </span>
            )}
            {product.is_draft === 1 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/90 text-navy-deep">
                Perlu Konfirmasi Harga
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-5 right-5">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold">
              {product.category_name}
            </span>
            <h2 className="text-2xl font-serif font-bold text-cream tracking-wide">
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-gold">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
              {product.discount_type && product.discount_value > 0 && (
                <span className="text-xs text-cream/50 line-through">
                  Rp {(product.price * 1.15).toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          {product.description && (
            <p className="text-sm text-cream/80 leading-relaxed font-sans border-b border-gold/15 pb-4">
              {product.description}
            </p>
          )}

          {/* Variants (Hot / Cold) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center justify-between">
                <span>Pilih Varian (Suhu)</span>
                <span className="text-[10px] text-cream/50 font-normal">Wajib dipilih</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariant === v.name;
                  return (
                    <button
                      key={v.id || v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v.name)}
                      className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-gold bg-gold/15 text-gold shadow-sm'
                          : 'border-gold/20 bg-navy-deep/40 text-cream/80 hover:border-gold/40'
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.price_difference > 0 ? (
                        <span className="text-xs text-gold-light">
                          +Rp {v.price_difference.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {product.addons && product.addons.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center justify-between">
                <span>Pilihan Tambahan (Add-on)</span>
                <span className="text-[10px] text-cream/50 font-normal">Opsional</span>
              </label>
              <div className="space-y-1.5">
                {product.addons.map((a: any) => {
                  const isChecked = selectedAddons.some((item) => item.id === a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a)}
                      className={`w-full p-2.5 rounded-xl border text-sm flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-gold bg-gold/15 text-gold'
                          : 'border-gold/20 bg-navy-deep/30 text-cream/80 hover:border-gold/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? 'border-gold bg-gold text-navy-deep' : 'border-gold/40'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{a.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gold-light">
                        +Rp {a.price.toLocaleString('id-ID')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Catatan Khusus
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kurang manis, es dipisah, sambal dipisah..."
              rows={2}
              className="w-full p-3 rounded-xl bg-navy-deep/60 border border-gold/25 text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Footer Actions: Quantity & Add to Cart */}
        <div className="p-4 bg-navy-deep/90 border-t border-gold/20 flex items-center justify-between gap-4">
          <div className="flex items-center border border-gold/30 rounded-xl bg-navy-dark px-2 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1.5 text-gold hover:text-gold-light active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm text-cream min-w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 text-gold hover:text-gold-light active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-between"
          >
            <span>Tambahkan</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

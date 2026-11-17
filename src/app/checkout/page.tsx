'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import { useCart } from '@/context/CartContext';
import {
  ChevronLeft,
  QrCode,
  User,
  Phone,
  Car,
  CreditCard,
  Banknote,
  Receipt,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    tableNumber,
    setTableNumber,
    clearCart,
    subtotal,
    discountTotal,
    taxTotal,
    finalTotal,
    itemCount,
  } = useCart();

  const [tables, setTables] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>(tableNumber || '');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cashier'); // cashier, qris, transfer, debit, credit
  const [activePaymentMethods, setActivePaymentMethods] = useState<any>({
    cashier: true,
    qris: true,
    transfer: true,
    debit: true,
    credit: true,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // If cart is empty, redirect back to menu
    if (items.length === 0) {
      router.push('/menu');
      return;
    }

    // Load logged in customer info if exists
    fetch('/api/auth/customer/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.customer) {
          if (!customerName) setCustomerName(data.customer.name);
          if (!customerPhone && data.customer.phone) setCustomerPhone(data.customer.phone);
        }
      })
      .catch(() => {});

    // Fetch tables
    fetch('/api/tables')
      .then((r) => r.json())
      .then((data) => {
        if (data.tables) setTables(data.tables);
      })
      .catch(() => {});

    // Fetch settings for active payment methods
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings && data.settings.payment_methods) {
          setActivePaymentMethods(data.settings.payment_methods);
        }
      })
      .catch(() => {});
  }, [items.length, router]);

  useEffect(() => {
    if (tableNumber) {
      setSelectedTable(tableNumber);
    }
  }, [tableNumber]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Nama pemesan wajib diisi.');
      return;
    }

    if (!selectedTable) {
      setErrorMsg('Pilih nomor meja atau area Anda.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find table record
      const tbl = tables.find((t) => t.table_number === selectedTable);
      const location = tbl ? tbl.table_name : `Meja ${selectedTable}`;

      // Prepare payload for backend
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        table_number: selectedTable,
        location,
        vehicle_plate: vehiclePlate.trim() || undefined,
        payment_method: paymentMethod,
        notes: generalNotes.trim() || undefined,
        items: items.map((it) => ({
          menu_item_id: it.productId,
          quantity: it.quantity,
          variant_name: it.variant,
          addon_ids: it.addons.map((a) => a.id),
          notes: it.notes,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      // Save table number
      setTableNumber(selectedTable);

      // Clear shopping cart
      clearCart();

      // If online payment (qris or transfer), redirect to payment simulation/instructions
      if (['qris', 'transfer', 'debit', 'credit'].includes(paymentMethod)) {
        router.push(`/payment?order_id=${data.order_id}&method=${paymentMethod}`);
      } else {
        // Cashier payment goes straight to tracking
        router.push(`/orders/${data.order_id}?created=true`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pesanan.');
      setIsSubmitting(false);
    }
  };

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
            Checkout Pesanan
          </h1>

          <div className="w-8" />
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-5">
          {/* Customer Information */}
          <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3.5">
            <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-2 pb-2 border-b border-gold/15">
              <User className="w-4 h-4 text-gold" />
              <span>Informasi Pelanggan</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center justify-between">
                <span>Nama Pemesan *</span>
                <span className="text-[10px] text-cream/50 font-normal">Wajib</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full p-3 rounded-xl bg-navy-deep/80 border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center justify-between">
                <span>Nomor WhatsApp</span>
                <span className="text-[10px] text-cream/50 font-normal">Untuk notifikasi status</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full p-3 rounded-xl bg-navy-deep/80 border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center justify-between">
                <span>Plat Nomor Kendaraan</span>
                <span className="text-[10px] text-cream/50 font-normal">Opsional (Car Wash)</span>
              </label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="Contoh: B 1234 ASI"
                className="w-full p-3 rounded-xl bg-navy-deep/80 border border-gold/25 text-xs text-cream placeholder-cream/40 uppercase focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Table Location Selection (Section 4.E & Section 10) */}
          <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gold/15">
              <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-2">
                <QrCode className="w-4 h-4 text-gold" />
                <span>Pilih Lokasi / Meja *</span>
              </h3>
              {tableNumber && (
                <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
                  Terbaca dari QR
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-cream/80">
                Pilih meja tempat Anda duduk:
              </label>
              <select
                required
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full p-3 rounded-xl bg-navy-deep border border-gold/30 text-xs text-cream focus:outline-none focus:border-gold font-sans"
              >
                <option value="">-- Pilih Nomor Meja --</option>
                {/* Standard Tables 01 to 23 */}
                <optgroup label="Meja Reguler (01 - 23)">
                  {tables
                    .filter((t) => t.table_type === 'standard')
                    .map((t) => (
                      <option key={t.id} value={t.table_number}>
                        {t.table_name} (Kapasitas {t.capacity} orang)
                      </option>
                    ))}
                </optgroup>
                {/* VIP Room */}
                <optgroup label="Area Khusus">
                  {tables
                    .filter((t) => t.table_type === 'vip')
                    .map((t) => (
                      <option key={t.id} value={t.table_number}>
                        {t.table_name} (VIP Room)
                      </option>
                    ))}
                  {tables
                    .filter((t) => t.table_type === 'carwash')
                    .map((t) => (
                      <option key={t.id} value={t.table_number}>
                        {t.table_name} (Car Wash)
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gold">
                Catatan Pesanan Umum
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Catatan untuk kasir / barista..."
                rows={2}
                className="w-full p-3 rounded-xl bg-navy-deep/80 border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Payment Method Selection (Section 4.E & Section 11) */}
          <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3.5">
            <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-2 pb-2 border-b border-gold/15">
              <CreditCard className="w-4 h-4 text-gold" />
              <span>Metode Pembayaran</span>
            </h3>

            <div className="space-y-2">
              {/* Cashier */}
              {activePaymentMethods.cashier !== false && (
                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cashier'
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-gold/20 bg-navy-deep/40 text-cream/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cashier"
                      checked={paymentMethod === 'cashier'}
                      onChange={() => setPaymentMethod('cashier')}
                      className="accent-gold"
                    />
                    <div>
                      <p className="font-bold text-xs">Bayar di Kasir (Cash / Manual)</p>
                      <p className="text-[10px] text-cream/60">
                        Bayar langsung ke kasir cafe setelah pesanan dibuat
                      </p>
                    </div>
                  </div>
                  <Banknote className="w-4 h-4 text-gold" />
                </label>
              )}

              {/* QRIS */}
              {activePaymentMethods.qris !== false && (
                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-gold/20 bg-navy-deep/40 text-cream/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="qris"
                      checked={paymentMethod === 'qris'}
                      onChange={() => setPaymentMethod('qris')}
                      className="accent-gold"
                    />
                    <div>
                      <p className="font-bold text-xs">QRIS (GoPay, OVO, Dana, BCA, dll)</p>
                      <p className="text-[10px] text-cream/60">
                        Pindai kode QRIS instan dari layar handphone Anda
                      </p>
                    </div>
                  </div>
                  <QrCode className="w-4 h-4 text-gold" />
                </label>
              )}

              {/* Bank Transfer */}
              {activePaymentMethods.transfer !== false && (
                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'transfer'
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-gold/20 bg-navy-deep/40 text-cream/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="accent-gold"
                    />
                    <div>
                      <p className="font-bold text-xs">Transfer Bank (Virtual Account)</p>
                      <p className="text-[10px] text-cream/60">
                        BCA, Mandiri, BNI, BRI Virtual Account
                      </p>
                    </div>
                  </div>
                  <Receipt className="w-4 h-4 text-gold" />
                </label>
              )}

              {/* Debit / Credit Card */}
              {(activePaymentMethods.debit !== false || activePaymentMethods.credit !== false) && (
                <label
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'credit'
                      ? 'border-gold bg-gold/15 text-gold'
                      : 'border-gold/20 bg-navy-deep/40 text-cream/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={paymentMethod === 'credit'}
                      onChange={() => setPaymentMethod('credit')}
                      className="accent-gold"
                    />
                    <div>
                      <p className="font-bold text-xs">Kartu Debit / Kredit</p>
                      <p className="text-[10px] text-cream/60">
                        Visa, Mastercard, JCB (Payment Gateway)
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-gold" />
                </label>
              )}
            </div>
          </div>

          {/* Final Order Review & Submit */}
          <div className="p-4 rounded-2xl border border-gold/30 bg-navy-dark space-y-2.5">
            <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-1.5 pb-2 border-b border-gold/15">
              <Receipt className="w-4 h-4 text-gold" />
              <span>Ringkasan Akhir</span>
            </h3>

            <div className="space-y-1.5 text-xs text-cream/80">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} item)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Diskon Promosi</span>
                  <span>- Rp {discountTotal.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pajak &amp; Layanan (11%)</span>
                <span>Rp {taxTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-gold/20 flex justify-between items-baseline font-bold text-sm text-gold">
                <span className="uppercase tracking-wider">Total Pembayaran</span>
                <span className="text-base">
                  Rp {finalTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-3 py-4 px-6 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <span>Buat Pesanan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Bottom Nav */}
      <CustomerBottomNav />
    </div>
  );
}

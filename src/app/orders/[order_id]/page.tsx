'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  UtensilsCrossed,
  Receipt,
  QrCode,
  User,
  Phone,
  Car,
  AlertCircle,
  PlusCircle,
  HelpCircle,
  X,
  CreditCard,
  Banknote,
  Send,
  Loader2,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'diterima', label: 'Diterima', desc: 'Pesanan masuk ke sistem kasir/dapur' },
  { key: 'diproses', label: 'Diproses', desc: 'Sedang disiapkan oleh chef & barista' },
  { key: 'siap', label: 'Siap', desc: 'Pesanan selesai disiapkan' },
  { key: 'diantar', label: 'Diantar', desc: 'Pelayan sedang mengantar ke meja Anda' },
  { key: 'selesai', label: 'Selesai', desc: 'Pesanan telah selesai dinikmati' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.order_id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [serviceModal, setServiceModal] = useState<'waiter' | 'bill' | null>(null);
  const [serviceSending, setServiceSending] = useState<boolean>(false);
  const [serviceFeedback, setServiceFeedback] = useState<string>('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Pesanan tidak ditemukan');
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat status pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Real-time polling every 5 seconds for status updates
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleServiceCall = async (type: 'waiter' | 'bill') => {
    setServiceSending(true);
    setServiceFeedback('');

    try {
      const res = await fetch(`/api/orders/${orderId}/service-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      setServiceFeedback(data.message || 'Permintaan Anda telah dikirim.');
      setTimeout(() => {
        setServiceModal(null);
        setServiceFeedback('');
      }, 2500);
    } catch {
      setServiceFeedback('Gagal mengirim panggilan. Silakan hubungi staff terdekat.');
    } finally {
      setServiceSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy text-cream flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <AsiaLogo size="md" variant="gold" />
          <p className="text-xs text-cream/60 flex items-center justify-center gap-1.5">
            <Loader2 className="w-4 h-4 animate-spin text-gold" />
            <span>Memuat status pesanan Anda...</span>
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-navy text-cream flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="font-serif font-bold text-lg text-cream">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-cream/70">{errorMsg || 'Nomor pesanan tidak valid.'}</p>
          <Link
            href="/menu"
            className="inline-block py-2.5 px-5 rounded-xl bg-gold text-navy-deep font-bold text-xs uppercase"
          >
            Buka Menu Cafe
          </Link>
        </div>
      </div>
    );
  }

  // Determine current step index
  const currentStepIndex = ORDER_STEPS.findIndex(
    (s) => s.key === order.order_status?.toLowerCase()
  );
  const activeIndex = currentStepIndex > -1 ? currentStepIndex : 0;

  return (
    <div className="min-h-screen bg-navy text-cream pb-24 relative overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy-deep/95 backdrop-blur-md border-b border-gold/20 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AsiaLogo size="sm" variant="gold" />
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-bold">
            <QrCode className="w-3.5 h-3.5" />
            <span>{order.location}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Order Header Card */}
        <div className="p-4 rounded-2xl border border-gold/30 bg-navy-dark space-y-2.5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-cream/50">
                Nomor Pesanan
              </span>
              <h2 className="text-lg font-serif font-bold text-gold tracking-wide">
                {order.order_number}
              </h2>
              <p className="text-xs text-cream/70 mt-0.5">
                {new Date(order.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                WIB &bull; {order.customer_name}
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.payment_status === 'paid'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {order.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
              </span>
              <p className="text-[10px] text-cream/50 uppercase mt-1">
                {order.payment_method === 'cashier' ? 'Bayar di Kasir' : order.payment_method}
              </p>
            </div>
          </div>

          {order.vehicle_plate && (
            <div className="pt-2 border-t border-gold/15 flex items-center gap-2 text-xs text-cream/80">
              <Car className="w-4 h-4 text-gold" />
              <span>
                Kendaraan Car Wash: <strong className="text-gold">{order.vehicle_plate}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Real-time Order Progress Steps (Section 4.F) */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-4">
          <div className="flex items-center justify-between border-b border-gold/15 pb-2">
            <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold animate-spin" style={{ animationDuration: '6s' }} />
              <span>Status Pesanan Real-Time</span>
            </h3>
            <span className="text-[10px] text-gold animate-pulse">Live Tracking</span>
          </div>

          <div className="space-y-4 relative pl-3">
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Step indicator circle */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 transition-all ${
                      isPast
                        ? 'bg-gold text-navy-deep'
                        : isCurrent
                        ? 'bg-gradient-to-r from-gold-dark to-gold text-navy-deep ring-4 ring-gold/25 shadow-goldGlow'
                        : 'bg-navy-deep border border-gold/30 text-cream/40'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  {/* Vertical connecting line */}
                  {idx < ORDER_STEPS.length - 1 && (
                    <div
                      className={`absolute left-3 top-6 w-0.5 h-8 -translate-x-1/2 ${
                        isPast ? 'bg-gold' : 'bg-gold/20'
                      }`}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold leading-none ${
                        isCurrent
                          ? 'text-gold text-sm'
                          : isPast
                          ? 'text-cream font-medium'
                          : 'text-cream/40'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${
                        isCurrent ? 'text-cream/90' : 'text-cream/50'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Panggil Pelayan & Minta Bill (Section 4.F) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setServiceModal('waiter')}
            className="p-3.5 rounded-2xl border border-gold/30 bg-navy-dark hover:bg-gold/10 text-gold text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-card active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5" />
            <span>Panggil Pelayan</span>
          </button>

          <button
            onClick={() => setServiceModal('bill')}
            className="p-3.5 rounded-2xl border border-gold/30 bg-navy-dark hover:bg-gold/10 text-gold text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-card active:scale-95 transition-all"
          >
            <Receipt className="w-5 h-5" />
            <span>Minta Bill</span>
          </button>
        </div>

        {/* Order Items Breakdown */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3">
          <div className="flex items-center justify-between border-b border-gold/15 pb-2">
            <h3 className="font-serif font-bold text-sm text-cream flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-gold" />
              <span>Rincian Menu</span>
            </h3>
            <span className="text-xs text-cream/60">{order.items?.length || 0} Menu</span>
          </div>

          <div className="space-y-2">
            {order.items?.map((it: any) => (
              <div
                key={it.id}
                className="flex items-start justify-between py-1.5 border-b border-gold/10 text-xs"
              >
                <div>
                  <p className="font-bold text-cream">
                    {it.quantity}x {it.product_name_snapshot}
                  </p>
                  {(it.variant_snapshot || (it.addons && it.addons.length > 0)) && (
                    <p className="text-[10px] text-gold/80 mt-0.5">
                      {it.variant_snapshot && `[${it.variant_snapshot}] `}
                      {it.addons?.map((a: any) => `+${a.name || a}`).join(', ')}
                    </p>
                  )}
                  {it.notes && (
                    <p className="text-[10px] text-cream/50 italic mt-0.5">
                      &ldquo;{it.notes}&rdquo;
                    </p>
                  )}
                </div>
                <span className="font-semibold text-cream">
                  Rp {it.total.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-2 space-y-1.5 text-xs text-cream/80 border-t border-gold/20">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {order.subtotal?.toLocaleString('id-ID')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Diskon</span>
                <span>- Rp {order.discount?.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pajak &amp; Layanan (11%)</span>
              <span>Rp {order.tax?.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-2 border-t border-gold/20 flex justify-between items-baseline font-bold text-sm text-gold">
              <span className="uppercase tracking-wider">Total</span>
              <span className="text-base">
                Rp {order.total?.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Add more items to same table without losing previous order */}
        <Link
          href={`/menu?table=${order.table_number || order.location}&add_order=1`}
          className="w-full py-3 px-4 rounded-xl border border-gold/40 bg-navy-deep text-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gold/15 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Pesan Tambahan di Meja Ini</span>
        </Link>
      </main>

      {/* Confirmation Modal for Service Calls (Panggil Pelayan / Minta Bill) */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream shadow-luxury text-center animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto">
              {serviceModal === 'waiter' ? <Bell className="w-6 h-6" /> : <Receipt className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-cream">
                {serviceModal === 'waiter' ? 'Panggil Pelayan?' : 'Minta Bill Pembayaran?'}
              </h3>
              <p className="text-xs text-cream/70 mt-1">
                Notifikasi akan langsung dikirim ke kasir &amp; staff untuk Meja{' '}
                <strong className="text-gold">{order.location}</strong>.
              </p>
            </div>

            {serviceFeedback ? (
              <div className="p-3 rounded-xl bg-gold/15 text-gold text-xs font-semibold animate-pulse">
                {serviceFeedback}
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  disabled={serviceSending}
                  className="w-1/2 py-2.5 rounded-xl border border-gold/30 text-xs font-bold text-cream/70 hover:bg-gold/10"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceCall(serviceModal)}
                  disabled={serviceSending}
                  className="w-1/2 py-2.5 rounded-xl bg-gold text-navy-deep text-xs font-bold shadow-goldGlow hover:brightness-110 flex items-center justify-center gap-1.5"
                >
                  {serviceSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Ya, Kirim</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
}

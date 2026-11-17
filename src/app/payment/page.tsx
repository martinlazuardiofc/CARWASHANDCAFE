'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AsiaLogo from '@/components/brand/AsiaLogo';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const method = searchParams.get('method') || 'qris';

  const [order, setOrder] = useState<any | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.order) {
          setOrder(data.order);
          if (data.order.payment_status === 'paid') {
            setPaymentSuccess(true);
          }

          // Generate sample QRIS
          const qrisPayload = `00020101021226580016ID.CO.ASIALUXURYCAFE.WWW01189360091800000000000215ASIA_CAFE_${data.order.order_number}520458125303360540${data.order.total}5802ID5920ASIA CAR WASH & CAFE6007JAKARTA6304E1F4`;
          try {
            const url = await QRCode.toDataURL(qrisPayload, {
              width: 320,
              margin: 1,
              color: { dark: '#0F2342', light: '#FFFFFF' },
            });
            setQrDataUrl(url);
          } catch {}
        }
      })
      .catch(() => {});
  }, [orderId]);

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setIsSimulating(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          method,
          action: 'simulate_success',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF6A', '#F5E9C8', '#0F2342'],
        });
        setTimeout(() => {
          router.push(`/orders/${orderId}?paid=true`);
        }, 1500);
      }
    } catch {
      // ignore
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyVa = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-navy text-cream flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <AsiaLogo size="md" variant="gold" />
          <p className="text-xs text-cream/60">Memuat rincian pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-cream pb-16 px-4 pt-6">
      <div className="max-w-md mx-auto space-y-5">
        <div className="text-center space-y-1">
          <AsiaLogo size="sm" variant="gold" />
          <h1 className="font-serif font-bold text-xl text-cream tracking-wide">
            Pembayaran Digital
          </h1>
          <p className="text-xs text-cream/70">
            Nomor Pesanan: <span className="font-bold text-gold">{order.order_number}</span>
          </p>
        </div>

        {paymentSuccess ? (
          <div className="p-6 rounded-3xl border border-green-500/40 bg-navy-dark text-center space-y-3 shadow-luxury">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-lg text-cream">
              Pembayaran Berhasil!
            </h2>
            <p className="text-xs text-cream/70">
              Terima kasih, pembayaran sebesar{' '}
              <span className="font-bold text-gold">
                Rp {order.total.toLocaleString('id-ID')}
              </span>{' '}
              telah kami terima.
            </p>
            <div className="pt-3">
              <Link
                href={`/orders/${order.id}`}
                className="w-full py-3.5 px-4 rounded-xl bg-gold text-navy-deep font-bold text-xs uppercase tracking-wider shadow-goldGlow flex items-center justify-center gap-2"
              >
                <span>Pantau Status Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl border border-gold/30 bg-navy-dark space-y-4 shadow-luxury">
            {/* Total Amount Header */}
            <div className="text-center pb-3 border-b border-gold/20">
              <span className="text-[10px] uppercase tracking-widest text-cream/60">
                Total yang Harus Dibayar
              </span>
              <p className="text-2xl font-serif font-extrabold text-gold mt-0.5">
                Rp {order.total.toLocaleString('id-ID')}
              </p>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Batas Waktu: 15 Menit</span>
              </div>
            </div>

            {/* QRIS / VA Mode */}
            {method === 'qris' ? (
              <div className="flex flex-col items-center space-y-3 py-1">
                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-gold max-w-[240px]">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QRIS Code" className="w-full h-auto rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-xs text-cream">
                    Scan dengan Aplikasi Pembayaran Apapun
                  </p>
                  <p className="text-[10px] text-cream/60">
                    Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                <div className="p-3.5 rounded-xl border border-gold/20 bg-navy-deep space-y-1">
                  <span className="text-[10px] uppercase text-cream/50">
                    BCA Virtual Account
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-gold tracking-wider">
                      88019{order.order_number.replace(/[^0-9]/g, '').slice(-8)}
                    </span>
                    <button
                      onClick={() =>
                        handleCopyVa(
                          `88019${order.order_number.replace(/[^0-9]/g, '').slice(-8)}`
                        )
                      }
                      className="text-xs text-gold flex items-center gap-1 bg-gold/10 px-2 py-1 rounded"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gateway Verification Notice */}
            <div className="p-3 rounded-xl bg-navy-deep/80 border border-gold/20 flex items-start gap-2.5 text-xs text-cream/70">
              <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <span>
                Pembayaran Anda divalidasi secara otomatis melalui webhook payment gateway.
              </span>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <span>Mengonfirmasi Pembayaran...</span>
                ) : (
                  <>
                    <span>Simulasikan Pembayaran Berhasil</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href={`/orders/${order.id}`}
                className="block text-center text-xs text-cream/60 hover:text-gold py-1"
              >
                Saya akan bayar nanti / Lihat status pesanan
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy text-cream flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

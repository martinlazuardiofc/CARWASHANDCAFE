'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tv,
  Clock,
  CheckCircle2,
  Bell,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchKitchenOrders = async () => {
    try {
      // Get all active orders (diterima or diproses)
      const res = await fetch('/api/orders?limit=50');
      const data = await res.json();
      if (data.orders) {
        // Filter orders that need preparation
        const active = data.orders.filter((o: any) =>
          ['diterima', 'diproses', 'siap'].includes(o.order_status)
        );
        setOrders(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: nextStatus }),
    });
    fetchKitchenOrders();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide flex items-center gap-2">
            <Tv className="w-6 h-6 text-gold" />
            <span>Kitchen &amp; Barista Display</span>
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Layar pesanan langsung untuk koki dan barista cafe (Fallback Kasir Display)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchKitchenOrders}
            className="p-2 rounded-xl border border-gold/30 bg-navy-deep text-gold"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
          <span>Memuat tiket pesanan dapur...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-gold/20 bg-navy-dark space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
          <h2 className="font-serif font-bold text-lg text-cream">Dapur Sedang Bersih &amp; Siap</h2>
          <p className="text-xs text-cream/60">Tidak ada pesanan aktif yang menunggu persiapan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((ord) => {
            const isDiterima = ord.order_status === 'diterima';
            const isDiproses = ord.order_status === 'diproses';
            const isSiap = ord.order_status === 'siap';

            return (
              <div
                key={ord.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between shadow-card transition-all ${
                  isDiterima
                    ? 'border-amber-500/50 bg-navy-dark ring-2 ring-amber-500/20'
                    : isDiproses
                    ? 'border-blue-500/50 bg-navy-dark ring-2 ring-blue-500/20'
                    : 'border-green-500/50 bg-navy-dark'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-2 border-b border-gold/15">
                    <div>
                      <span className="font-mono text-xs font-bold text-gold">
                        {ord.order_number}
                      </span>
                      <h3 className="font-serif font-bold text-base text-cream mt-0.5">
                        {ord.location}
                      </h3>
                      <p className="text-xs text-cream/70">{ord.customer_name}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isDiterima
                          ? 'bg-amber-500 text-navy-deep'
                          : isDiproses
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                  </div>

                  {/* Notes if any */}
                  {ord.notes && (
                    <div className="my-2 p-2 rounded-lg bg-navy-deep text-[11px] text-amber-300 italic border border-amber-500/20">
                      Catatan: &ldquo;{ord.notes}&rdquo;
                    </div>
                  )}

                  {/* Ticket Items */}
                  <div className="py-2.5 space-y-2 text-xs">
                    <p className="text-[10px] uppercase font-bold text-cream/50">
                      {ord.item_count} Menu Dipesan
                    </p>
                    <p className="text-xs text-cream/80">
                      Buka rincian di panel pesanan untuk rincian varian &amp; topping lengkap.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gold/15 flex gap-2">
                  {isDiterima && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'diproses')}
                      className="w-full py-2.5 rounded-xl bg-gold text-navy-deep font-bold text-xs uppercase hover:brightness-110"
                    >
                      Mulai Siapkan (Diproses)
                    </button>
                  )}
                  {isDiproses && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'siap')}
                      className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-bold text-xs uppercase hover:brightness-110"
                    >
                      Tandai Siap Diantar
                    </button>
                  )}
                  {isSiap && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'diantar')}
                      className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-xs uppercase hover:brightness-110"
                    >
                      Pesanan Diantar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

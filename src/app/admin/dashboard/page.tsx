'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  RefreshCw,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
  Instagram,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Send,
  Loader2,
  Filter,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Check if new orders arrived to play chime
        if (json.kpi?.today_orders > lastOrderCount && lastOrderCount > 0 && soundEnabled) {
          playAudioChime();
        }
        setLastOrderCount(json.kpi?.today_orders || 0);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const playAudioChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    fetchDashboard();
    // Poll every 8 seconds for real-time dashboard updates
    const timer = setInterval(fetchDashboard, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setStatusUpdatingId(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: nextStatus }),
      });
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleRetryKasir = async (orderId: string) => {
    setRetryingOrderId(orderId);
    try {
      await fetch(`/api/orders/${orderId}/retry-kasir`, { method: 'POST' });
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-cream/60 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-gold" />
        <span>Memuat data dashboard administrator...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {};
  const charts = data?.charts || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Dashboard Administrator
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Ringkasan Operasional &bull; ASIA Car Wash &amp; Cafe
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'border-gold/40 bg-gold/15 text-gold'
                : 'border-gold/20 bg-navy-deep text-cream/50'
            }`}
            title="Toggle Notifikasi Suara"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Suara: {soundEnabled ? 'Aktif' : 'Mati'}</span>
          </button>

          <button
            onClick={fetchDashboard}
            className="p-2 rounded-xl border border-gold/30 bg-navy-deep text-gold hover:bg-gold/15 active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kasir Sync Alert Banner (Section 7 & 14) */}
      {kpi.failed_kasir_syncs > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-amber-200">
                {kpi.failed_kasir_syncs} Pesanan Belum Terkirim ke Kasir Eksternal
              </p>
              <p className="text-xs text-cream/70">
                Endpoint kasir belum merespons. Pesanan tetap aman tercatat di sistem cafe &amp; kitchen display.
              </p>
            </div>
          </div>
          <Link
            href="/admin/integrations"
            className="py-2 px-3.5 rounded-xl bg-amber-500 text-navy-deep font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Buka Modul Kasir</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Omzet Hari Ini */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold font-sans">
              Omzet Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-gold/15 text-gold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-cream tracking-tight">
            Rp {Number(kpi.today_revenue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-cream/50">
            Total bruto: Rp {Number(kpi.today_gross || 0).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Pesanan Hari Ini */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold font-sans">
              Pesanan Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-gold/15 text-gold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-cream tracking-tight">
            {kpi.today_orders || 0}
          </p>
          <p className="text-[10px] text-cream/50">
            {kpi.pending_orders || 0} menunggu &bull; {kpi.processing_orders || 0} proses
          </p>
        </div>

        {/* Pesanan Selesai */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-400 font-sans">
              Pesanan Selesai
            </span>
            <div className="p-2 rounded-xl bg-green-500/15 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-cream tracking-tight">
            {kpi.completed_orders || 0}
          </p>
          <p className="text-[10px] text-cream/50">
            {kpi.ready_orders || 0} siap diantar
          </p>
        </div>

        {/* Jumlah Pelanggan */}
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold font-sans">
              Akun Pelanggan
            </span>
            <div className="p-2 rounded-xl bg-gold/15 text-gold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-extrabold text-cream tracking-tight">
            {kpi.customer_count || 0}
          </p>
          <p className="text-[10px] text-cream/50">Member terdaftar</p>
        </div>
      </div>

      {/* Analytics & Top Selling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue 7 Days Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-cream">
                Tren Omzet (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-cream/60">Performa transaksi digital cafe</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gold" />
          </div>

          <div className="space-y-2 pt-2">
            {charts.last7Days && charts.last7Days.length > 0 ? (
              <div className="space-y-2">
                {charts.last7Days.map((d: any) => {
                  const maxRev = Math.max(...charts.last7Days.map((i: any) => i.revenue || 1), 100000);
                  const pct = Math.min(100, Math.round((d.revenue / maxRev) * 100));

                  return (
                    <div key={d.date} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-cream/80 font-mono">{d.date}</span>
                        <span className="text-gold font-bold">
                          Rp {Number(d.revenue).toLocaleString('id-ID')} ({d.order_count} order)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-navy-deep overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-cream/50 border border-gold/10 rounded-xl">
                Belum ada transaksi dalam 7 hari terakhir.
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Menu Items */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4">
          <h3 className="font-serif font-bold text-base text-cream">
            Menu Terlaris
          </h3>

          <div className="space-y-2.5">
            {charts.topSelling && charts.topSelling.length > 0 ? (
              charts.topSelling.map((it: any, idx: number) => (
                <div
                  key={it.name}
                  className="p-2.5 rounded-xl border border-gold/15 bg-navy-deep flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-cream truncate">{it.name}</p>
                  </div>
                  <span className="text-xs font-extrabold text-gold flex-shrink-0">
                    {it.total_qty} Terjual
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-cream/50">Belum ada data penjualan</div>
            )}
          </div>

          {/* Quick Business Links (Section 7) */}
          <div className="pt-3 border-t border-gold/15 space-y-2">
            <a
              href="https://instagram.com/asiacarwashandcafe"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl border border-gold/25 bg-navy-deep text-gold text-xs font-bold flex items-center justify-between hover:bg-gold/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gold" />
                <span>Instagram: @asiacarwashandcafe</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://maps.app.goo.gl/1BwPD4VX9QfCVcxq7?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl border border-gold/25 bg-navy-deep text-gold text-xs font-bold flex items-center justify-between hover:bg-gold/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Lokasi Google Maps</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Real-time Order Stream Table */}
      <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/15 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-cream flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span>Daftar Pesanan Terbaru (Real-Time)</span>
            </h3>
            <p className="text-xs text-cream/60">
              Perubahan status otomatis tersinkron ke layar pelanggan
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs text-gold font-bold flex items-center gap-1 hover:underline"
          >
            <span>Semua Pesanan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-cream/60">
            Belum ada pesanan yang masuk hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Meja / Lokasi</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Pembayaran</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-navy-deep/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-gold">
                      {ord.order_number}
                    </td>
                    <td className="p-3 text-[11px] text-cream/60">
                      {new Date(ord.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-semibold text-cream">
                      {ord.location}
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-cream">{ord.customer_name}</span>
                      {ord.vehicle_plate && (
                        <span className="block text-[10px] text-gold">{ord.vehicle_plate}</span>
                      )}
                    </td>
                    <td className="p-3 font-extrabold text-gold">
                      Rp {ord.total?.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.payment_status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gold/15 text-gold border border-gold/30">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* Status changer shortcuts */}
                      {ord.order_status === 'diterima' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'diproses')}
                          disabled={statusUpdatingId === ord.id}
                          className="px-2.5 py-1 rounded bg-gold text-navy-deep font-bold text-[10px] uppercase hover:brightness-110"
                        >
                          Proses
                        </button>
                      )}
                      {ord.order_status === 'diproses' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'siap')}
                          disabled={statusUpdatingId === ord.id}
                          className="px-2.5 py-1 rounded bg-blue-500 text-white font-bold text-[10px] uppercase hover:brightness-110"
                        >
                          Siap
                        </button>
                      )}
                      {ord.order_status === 'siap' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'diantar')}
                          disabled={statusUpdatingId === ord.id}
                          className="px-2.5 py-1 rounded bg-purple-500 text-white font-bold text-[10px] uppercase hover:brightness-110"
                        >
                          Antar
                        </button>
                      )}
                      {ord.order_status === 'diantar' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'selesai')}
                          disabled={statusUpdatingId === ord.id}
                          className="px-2.5 py-1 rounded bg-green-500 text-white font-bold text-[10px] uppercase hover:brightness-110"
                        >
                          Selesai
                        </button>
                      )}

                      {/* Cashier sync failure retry button */}
                      {ord.kasir_sync_status === 'failed' && (
                        <button
                          onClick={() => handleRetryKasir(ord.id)}
                          disabled={retryingOrderId === ord.id}
                          className="px-2 py-1 rounded border border-amber-500 text-amber-400 text-[10px] font-bold hover:bg-amber-500/10"
                          title="Kirim Ulang ke Kasir"
                        >
                          {retryingOrderId === ord.id ? 'Mengirim...' : 'Kirim Kasir'}
                        </button>
                      )}

                      <Link
                        href={`/orders/${ord.id}`}
                        className="px-2 py-1 rounded border border-gold/30 text-gold text-[10px] font-bold hover:bg-gold/10 inline-block"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

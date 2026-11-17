'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  QrCode,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = '/api/reports?';
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleExportCsv = () => {
    let url = '/api/reports?format=csv';
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    window.open(url, '_blank');
  };

  const summary = data?.summary || {};
  const dailySales = data?.dailySales || [];
  const topSelling = data?.topSelling || [];
  const slowMoving = data?.slowMoving || [];
  const paymentBreakdown = data?.paymentBreakdown || [];
  const salesByTable = data?.salesByTable || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Laporan Penjualan &amp; Omzet
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Analisis penjualan harian, mingguan, bulanan, menu terlaris, dan ekspor CSV
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="py-3 px-4 rounded-xl bg-gold text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Laporan</span>
        </button>
      </div>

      {/* Date Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
          <span className="font-semibold text-cream">Rentang Tanggal:</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream focus:outline-none focus:border-gold"
          />
          <span className="text-xs text-cream/50">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream focus:outline-none focus:border-gold"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-gold underline hover:text-gold-light"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-gold">Total Penjualan Bruto</span>
          <p className="text-xl font-serif font-extrabold text-cream">
            Rp {Number(summary.total_gross_sales || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-cream/50">{summary.total_orders || 0} Total Pesanan</p>
        </div>

        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-green-400">Total Omzet Lunas</span>
          <p className="text-xl font-serif font-extrabold text-cream">
            Rp {Number(summary.total_paid_sales || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-cream/50">Terverifikasi kasir / gateway</p>
        </div>

        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-gold">Rata-rata Order (AOV)</span>
          <p className="text-xl font-serif font-extrabold text-cream">
            Rp {Math.round(Number(summary.average_order_value || 0)).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-cream/50">Per keranjang belanja</p>
        </div>

        <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-gold">Pajak &amp; Diskon</span>
          <p className="text-xl font-serif font-extrabold text-cream">
            Rp {Number(summary.total_tax_collected || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-cream/50">
            Diskon: Rp {Number(summary.total_discounts_given || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Grid: Top Selling vs Slow Moving */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span>Menu Terlaris (Top Selling)</span>
          </h3>

          <div className="space-y-2">
            {topSelling.map((it: any, idx: number) => (
              <div
                key={it.item_name}
                className="p-2.5 rounded-xl bg-navy-deep border border-gold/15 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-cream truncate">{it.item_name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-extrabold text-gold">{it.qty_sold} porsi</span>
                  <span className="block text-[10px] text-cream/50">
                    Rp {Number(it.revenue_generated).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream">
            Produk Kurang Laku (Slow Moving)
          </h3>

          <div className="space-y-2">
            {slowMoving.map((it: any) => (
              <div
                key={it.item_name}
                className="p-2.5 rounded-xl bg-navy-deep border border-gold/15 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-cream">{it.item_name}</span>
                  <span className="block text-[10px] text-gold/70">{it.category_name}</span>
                </div>
                <span className="font-bold text-cream/60">{it.qty_sold} terjual</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Payment Method Breakdown & Sales by Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold" />
            <span>Metode Pembayaran</span>
          </h3>

          <div className="space-y-2">
            {paymentBreakdown.map((pm: any) => (
              <div
                key={pm.payment_method}
                className="p-2.5 rounded-xl bg-navy-deep border border-gold/15 flex items-center justify-between text-xs"
              >
                <span className="font-bold uppercase text-gold">{pm.payment_method}</span>
                <div className="text-right">
                  <span className="font-extrabold text-cream">
                    Rp {Number(pm.total_amount).toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-cream/50">{pm.count} transaksi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Table */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream flex items-center gap-2">
            <QrCode className="w-4 h-4 text-gold" />
            <span>Penjualan Berdasarkan Meja</span>
          </h3>

          <div className="space-y-2">
            {salesByTable.map((tb: any) => (
              <div
                key={tb.location}
                className="p-2.5 rounded-xl bg-navy-deep border border-gold/15 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-cream">{tb.location}</span>
                <div className="text-right">
                  <span className="font-extrabold text-gold">
                    Rp {Number(tb.total_revenue).toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-cream/50">{tb.orders_count} pesanan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

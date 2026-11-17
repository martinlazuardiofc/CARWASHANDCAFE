'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  X,
  AlertTriangle,
  RotateCw,
  Eye,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const fetchOrders = async () => {
    try {
      let url = '/api/orders?limit=100';
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: nextStatus }),
    });
    fetchOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, order_status: nextStatus });
    }
  };

  const handleUpdatePayment = async (orderId: string, paymentStatus: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
    fetchOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
    }
  };

  const openOrderDetail = async (order: any) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      if (data.order) {
        setSelectedOrder(data.order);
        setIsDetailOpen(true);
      }
    } catch {
      setSelectedOrder(order);
      setIsDetailOpen(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Manajemen Pesanan
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Pantau seluruh pesanan meja, car wash, status pembayaran, dan cetak bill
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-gold/30 bg-navy-dark text-gold hover:bg-gold/15 active:scale-95 transition-all self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold"
        >
          <RotateCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3 shadow-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari order number, nama pelanggan, no telepon..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {['all', 'diterima', 'diproses', 'siap', 'diantar', 'selesai'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-gold text-navy-deep'
                    : 'bg-navy-deep border border-gold/20 text-cream/70 hover:text-cream'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gold/15">
          <span className="text-xs text-cream/60">Total {orders.length} pesanan ditemukan</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat data pesanan...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-cream/60">
            Tidak ada pesanan yang sesuai dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Metode Bayar</th>
                  <th className="p-3">Status Bayar</th>
                  <th className="p-3">Status Pesanan</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-navy-deep/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-gold">{ord.order_number}</td>
                    <td className="p-3 text-[11px] text-cream/60">
                      {new Date(ord.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-semibold text-cream">{ord.location}</td>
                    <td className="p-3">
                      <span className="font-bold text-cream">{ord.customer_name}</span>
                      {ord.customer_phone && (
                        <span className="block text-[10px] text-cream/50">{ord.customer_phone}</span>
                      )}
                    </td>
                    <td className="p-3 font-extrabold text-gold">
                      Rp {ord.total?.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 uppercase text-[10px] text-cream/70 font-semibold">
                      {ord.payment_method}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.payment_status === 'paid'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="px-2.5 py-1 rounded-lg border border-gold/30 text-gold hover:bg-gold/15 font-bold text-[10px]"
                      >
                        Lihat / Cetak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal & Thermal Receipt Preview (Section 14 & 19) */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-navy-dark border border-gold/30 rounded-3xl p-5 space-y-4 text-cream shadow-luxury max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gold/15">
              <div>
                <span className="text-[10px] uppercase text-gold font-bold">Rincian Pesanan</span>
                <h3 className="font-serif font-bold text-base text-cream">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Changers */}
            <div className="p-3 rounded-xl bg-navy-deep border border-gold/20 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gold">
                Ubah Status Pesanan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['diterima', 'diproses', 'siap', 'diantar', 'selesai'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      selectedOrder.order_status === st
                        ? 'bg-gold text-navy-deep font-extrabold shadow-sm'
                        : 'bg-navy-dark border border-gold/20 text-cream/70 hover:text-cream'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gold/15">
                <span className="text-[10px] text-cream/60">Status Pembayaran:</span>
                <div className="space-x-1.5">
                  <button
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'paid')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedOrder.payment_status === 'paid'
                        ? 'bg-green-500 text-white'
                        : 'border border-green-500/40 text-green-400'
                    }`}
                  >
                    Lunas
                  </button>
                  <button
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'unpaid')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedOrder.payment_status === 'unpaid'
                        ? 'bg-amber-500 text-navy-deep'
                        : 'border border-amber-500/40 text-amber-400'
                    }`}
                  >
                    Belum Lunas
                  </button>
                </div>
              </div>
            </div>

            {/* Printable Thermal Receipt Component */}
            <div className="p-4 rounded-xl bg-white text-navy-deep font-mono text-[11px] space-y-2 border border-slate-300 shadow-sm printable-receipt">
              <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
                <p className="font-extrabold text-sm uppercase">ASIA CAR WASH &amp; CAFE</p>
                <p className="text-[10px]">A Taste of Comfort, A Touch of Luxury</p>
                <p className="text-[10px]">Hotline: +62 812-3456-7890</p>
              </div>

              <div className="flex justify-between text-[10px]">
                <span>No: {selectedOrder.order_number}</span>
                <span>{new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Lokasi: {selectedOrder.location}</span>
                <span>{selectedOrder.customer_name}</span>
              </div>

              <div className="py-2 border-t border-b border-dashed border-slate-400 space-y-1">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <div>
                      <p className="font-bold">
                        {it.quantity}x {it.product_name_snapshot}
                      </p>
                      {it.variant_snapshot && (
                        <p className="text-[9px] text-slate-500">[{it.variant_snapshot}]</p>
                      )}
                    </div>
                    <span>Rp {it.total.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {selectedOrder.subtotal?.toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span>- Rp {selectedOrder.discount?.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax &amp; Service (11%):</span>
                  <span>Rp {selectedOrder.tax?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>Rp {selectedOrder.total?.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[10px] space-y-0.5">
                <p>Metode: {selectedOrder.payment_method?.toUpperCase()} ({selectedOrder.payment_status?.toUpperCase()})</p>
                <p className="italic">Terima kasih atas kunjungan Anda!</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex gap-2 pt-1 no-print">
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-xl bg-gold text-navy-deep font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-goldGlow hover:brightness-110"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bill Thermal (80mm)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

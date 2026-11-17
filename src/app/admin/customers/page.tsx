'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Loader2 } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customers
    fetch('/api/reports')
      .then(() => {
        // We can fetch from a direct query or customer endpoint
        return fetch('/api/admin/dashboard');
      })
      .then(() => {
        // Direct query through dedicated endpoint or reports
        return fetch('/api/audit-logs?limit=1');
      })
      .then(async () => {
        // We can fetch customer list
        const res = await fetch('/api/orders?limit=100');
        const json = await res.json();
        // Aggregate customer data from orders
        const map = new Map<string, any>();
        if (json.orders) {
          for (const o of json.orders) {
            const key = o.customer_name.toLowerCase();
            if (!map.has(key)) {
              map.set(key, {
                name: o.customer_name,
                phone: o.customer_phone || '-',
                order_count: 1,
                total_spent: o.total,
                last_order: o.created_at,
              });
            } else {
              const existing = map.get(key);
              existing.order_count += 1;
              existing.total_spent += o.total;
            }
          }
        }
        setCustomers(Array.from(map.values()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Data Pelanggan &amp; Member
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Daftar pelanggan, frekuensi kunjungan, dan total transaksi
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pelanggan atau nomor telepon..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat data pelanggan...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-cream/60">
            Belum ada data pelanggan yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Nama Pelanggan</th>
                  <th className="p-3">No. WhatsApp</th>
                  <th className="p-3">Jumlah Kunjungan</th>
                  <th className="p-3">Total Belanja</th>
                  <th className="p-3">Pesanan Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {filtered.map((c, i) => (
                  <tr key={i} className="hover:bg-navy-deep/40 transition-colors">
                    <td className="p-3 font-bold text-cream font-serif text-sm">{c.name}</td>
                    <td className="p-3 font-mono text-cream/70">{c.phone}</td>
                    <td className="p-3 font-semibold text-gold">{c.order_count} Pesanan</td>
                    <td className="p-3 font-extrabold text-cream">
                      Rp {Number(c.total_spent).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-[11px] text-cream/60">
                      {new Date(c.last_order).toLocaleDateString('id-ID')}
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

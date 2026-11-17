'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Loader2, AlertCircle } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/audit-logs?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) {
          setLogs(data.logs);
        } else if (data.error) {
          setErrorMsg(data.error);
        }
      })
      .catch(() => setErrorMsg('Gagal memuat audit log'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_name && l.user_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (errorMsg) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-cream">Akses Terbatas</h2>
        <p className="text-xs text-cream/70 max-w-sm mx-auto">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <span>Audit Trail &amp; Log Keamanan (Owner)</span>
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Pencatatan riwayat perubahan produk, harga, pesanan, dan konfigurasi sistem
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
            placeholder="Cari aksi, entitas, atau nama user..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat audit trail...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-cream/60">
            Belum ada audit log yang sesuai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Entitas</th>
                  <th className="p-3">ID Target</th>
                  <th className="p-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10 font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-deep/40 transition-colors">
                    <td className="p-3 text-cream/60 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 font-sans font-bold text-cream">
                      {log.user_name || 'System'}
                    </td>
                    <td className="p-3 font-bold text-gold">{log.action}</td>
                    <td className="p-3 text-cream/80">{log.entity}</td>
                    <td className="p-3 text-cream/60">{log.entity_id}</td>
                    <td className="p-3 max-w-xs truncate text-[10px] text-cream/70" title={log.changes}>
                      {log.changes}
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

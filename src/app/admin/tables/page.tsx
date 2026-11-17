'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AsiaLogo from '@/components/brand/AsiaLogo';
import {
  QrCode,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  RotateCw,
  ExternalLink,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableForPrint, setSelectedTableForPrint] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);

  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableType, setTableType] = useState('standard');
  const [capacity, setCapacity] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.tables) setTables(data.tables);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const openCreateModal = () => {
    setEditingTable(null);
    setTableNumber('');
    setTableName('');
    setTableType('standard');
    setCapacity(4);
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTable(t);
    setTableNumber(t.table_number);
    setTableName(t.table_name);
    setTableType(t.table_type);
    setCapacity(t.capacity);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingTable ? `/api/tables/${editingTable.id}` : '/api/tables';
      const method = editingTable ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: tableNumber.trim(),
          table_name: tableName.trim(),
          table_type: tableType,
          capacity: Number(capacity),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan meja');

      setIsModalOpen(false);
      fetchTables();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan meja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateQr = async (id: string) => {
    if (!confirm('Regenerasi token QR untuk meja ini? Token lama akan kedaluwarsa.')) return;
    await fetch(`/api/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerate_qr: true }),
    });
    fetchTables();
  };

  const handlePrintCard = (tbl: any) => {
    setSelectedTableForPrint(tbl);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20 no-print">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Manajemen Meja &amp; QR Code
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Konfigurasi Meja 01–23, Meja VIP Room, Area Tunggu / Car Wash, dan Cetak QR Code
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Meja Baru</span>
        </button>
      </div>

      {/* Table Cards Grid */}
      <div className="space-y-4 no-print">
        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat data meja &amp; QR...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className="p-4 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                        {tbl.table_type === 'vip'
                          ? 'VIP ROOM'
                          : tbl.table_type === 'carwash'
                          ? 'AREA TUNGGU'
                          : 'REGULER'}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-cream">
                        {tbl.table_name}
                      </h3>
                      <p className="text-[11px] text-cream/60">Kapasitas: {tbl.capacity} Orang</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          tbl.is_active === 1
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {tbl.is_active === 1 ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                  </div>

                  {/* QR Preview Frame */}
                  <div className="my-3 p-3 bg-white rounded-xl border-2 border-gold/40 flex flex-col items-center justify-center">
                    {tbl.qr_data_url ? (
                      <img
                        src={tbl.qr_data_url}
                        alt={`QR ${tbl.table_name}`}
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                      </div>
                    )}
                    <p className="text-[9px] font-mono text-navy-deep font-bold mt-1 text-center truncate max-w-[140px]">
                      /m/{tbl.table_number}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-1.5 pt-2 border-t border-gold/15">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handlePrintCard(tbl)}
                      className="py-2 px-2.5 rounded-lg bg-gold text-navy-deep text-[11px] font-bold flex items-center justify-center gap-1 hover:brightness-110"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Meja</span>
                    </button>

                    {tbl.qr_data_url && (
                      <a
                        href={tbl.qr_data_url}
                        download={`QR_Meja_${tbl.table_number}_ASIA_CAFE.png`}
                        className="py-2 px-2.5 rounded-lg border border-gold/30 bg-navy-deep text-gold text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-gold/15"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => handleRegenerateQr(tbl.id)}
                      className="text-cream/60 hover:text-gold flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Reset Token</span>
                    </button>

                    <button
                      onClick={() => openEditModal(tbl)}
                      className="text-gold font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Luxury Table QR Card Frame (Section 10 Design Requirements) */}
      {selectedTableForPrint && (
        <div className="printable-receipt hidden print:block">
          <div
            style={{
              width: '100mm',
              padding: '12mm 8mm',
              border: '3px solid #D4AF6A',
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: '#0F2342',
              color: '#F5E9C8',
              fontFamily: 'serif',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <AsiaLogo size="sm" variant="gold" />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#D4AF6A', margin: '4px 0' }}>
              {selectedTableForPrint.table_name}
            </h2>

            <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#FAF4E6', margin: '2px 0 12px 0' }}>
              A Taste of Comfort, A Touch of Luxury
            </p>

            {/* QR box */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '8px',
                borderRadius: '10px',
                display: 'inline-block',
                margin: '0 auto',
                border: '2px solid #D4AF6A',
              }}
            >
              <img
                src={selectedTableForPrint.qr_data_url}
                alt="QR Code"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#D4AF6A',
                  margin: '4px 0',
                }}
              >
                Scan to Order
              </p>
              <p style={{ fontSize: '9px', color: '#E8D8AF', margin: '0' }}>
                Pindai kamera ponsel Anda untuk membuka menu digital &amp; memesan langsung
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm no-print">
          <div className="w-full max-w-sm bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream shadow-luxury">
            <div className="flex items-center justify-between pb-2 border-b border-gold/15">
              <h3 className="font-serif font-bold text-base text-cream">
                {editingTable ? 'Edit Meja' : 'Tambah Meja Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">
                  Nomor Meja (Unik, e.g. 24, VIP, CARWASH)
                </label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value);
                    if (!editingTable) setTableName(`Meja ${e.target.value}`);
                  }}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Nama Tampilan Meja</label>
                <input
                  type="text"
                  required
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Tipe Meja</label>
                  <select
                    value={tableType}
                    onChange={(e) => setTableType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  >
                    <option value="standard">Reguler</option>
                    <option value="vip">VIP Room</option>
                    <option value="carwash">Area Car Wash</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Kapasitas</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-gold/30 font-bold uppercase text-cream/80 hover:bg-gold/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-gold text-navy-deep font-bold uppercase shadow-goldGlow hover:brightness-110"
                >
                  Simpan Meja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

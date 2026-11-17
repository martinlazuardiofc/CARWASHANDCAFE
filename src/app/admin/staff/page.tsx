'use client';

import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Edit2, Trash2, Key, Shield, X, Loader2, AlertCircle } from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'OWNER'>('STAFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Akses ditolak: Hanya OWNER yang dapat mengelola staff.');
        return;
      }
      if (data.staff) setStaffList(data.staff);
    } catch {
      setErrorMsg('Gagal memuat staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('STAFF');
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setPassword('');
    setRole(s.role);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = '/api/admin/staff';
      const method = editingStaff ? 'PUT' : 'POST';
      const payload: any = { name: name.trim(), email: email.trim(), role };
      if (editingStaff) payload.id = editingStaff.id;
      if (password) payload.password = password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan staff');

      setIsModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Hapus akun staff ini?')) return;
    const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Gagal menghapus');
      return;
    }
    fetchStaff();
  };

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
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Manajemen Akun Staff &amp; Administrator
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Kelola hak akses OWNER dan STAFF cafe (Role-Based Access Control)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat data staff...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Dibuat Pada</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-navy-deep/40 transition-colors">
                    <td className="p-3 font-bold text-cream font-serif text-sm">{s.name}</td>
                    <td className="p-3 font-mono text-cream/70">{s.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.role === 'OWNER'
                            ? 'bg-gold/20 text-gold border border-gold/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-cream/50">
                      {new Date(s.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/15"
                        title="Edit / Reset Password"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/15"
                        title="Hapus Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream shadow-luxury">
            <div className="flex items-center justify-between pb-2 border-b border-gold/15">
              <h3 className="font-serif font-bold text-base text-cream">
                {editingStaff ? 'Edit Staff' : 'Tambah Staff Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">Email Login</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">
                  {editingStaff ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">Role Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'STAFF' | 'OWNER')}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                >
                  <option value="STAFF">STAFF (Pesanan &amp; Ketersediaan Menu)</option>
                  <option value="OWNER">OWNER (Full Akses Seluruh Fitur)</option>
                </select>
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
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

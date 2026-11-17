'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, X, Loader2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(cat.sort_order || 0);
    setIsActive(cat.is_active === 1);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), sort_order: Number(sortOrder), is_active: isActive ? 1 : 0 }),
      });

      setIsModalOpen(false);
      fetchCategories();
    } catch {
      alert('Gagal menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus / nonaktifkan kategori ini?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Manajemen Kategori Menu
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Atur 15 kategori makanan, kopi, teh, mocktail, dan add-ons
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat kategori...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Urutan</th>
                  <th className="p-3">Nama Kategori</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Jumlah Produk</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-navy-deep/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-gold">{c.sort_order}</td>
                    <td className="p-3 font-serif font-bold text-sm text-cream">{c.name}</td>
                    <td className="p-3 font-mono text-cream/60">{c.slug}</td>
                    <td className="p-3 font-semibold text-cream">{c.product_count || 0} Produk</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          c.is_active === 1
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {c.is_active === 1 ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/15"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/15"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream shadow-luxury">
            <div className="flex items-center justify-between pb-2 border-b border-gold/15">
              <h3 className="font-serif font-bold text-base text-cream">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Slug URL</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Urutan</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="p-2.5 rounded-xl border border-gold/20 bg-navy-deep flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-gold"
                    />
                    <span>Aktif</span>
                  </label>
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

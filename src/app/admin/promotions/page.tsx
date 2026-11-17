'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  Calendar,
  X,
  Loader2,
  Upload,
  AlertCircle,
} from 'lucide-react';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState<number | string>(10);
  const [targetType, setTargetType] = useState('all');
  const [targetId, setTargetId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Announcement fields
  const [announcementActive, setAnnouncementActive] = useState('1');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementSavedMsg, setAnnouncementSavedMsg] = useState('');

  const fetchData = async () => {
    try {
      const [promRes, catRes, setRes] = await Promise.all([
        fetch('/api/promotions').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      if (promRes.promotions) setPromotions(promRes.promotions);
      if (catRes.categories) setCategories(catRes.categories);
      if (setRes.settings) {
        setAnnouncementActive(setRes.settings.announcement_active || '1');
        setAnnouncementTitle(setRes.settings.announcement_title || '');
        setAnnouncementText(setRes.settings.announcement_text || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setTitle('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80');
    setDiscountType('percentage');
    setDiscountValue(10);
    setTargetType('all');
    setTargetId('');
    setIsActive(true);
    setSortOrder(promotions.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingPromo(p);
    setTitle(p.title);
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setDiscountType(p.discount_type || 'percentage');
    setDiscountValue(p.discount_value || 0);
    setTargetType(p.target_type || 'all');
    setTargetId(p.target_id || '');
    setIsActive(p.is_active === 1);
    setSortOrder(p.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingPromo ? `/api/promotions/${editingPromo.id}` : '/api/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
          discount_type: discountType,
          discount_value: Number(discountValue),
          target_type: targetType,
          target_id: targetId || null,
          is_active: isActive ? 1 : 0,
          sort_order: Number(sortOrder),
        }),
      });

      setIsModalOpen(false);
      fetchData();
    } catch {
      alert('Gagal menyimpan promosi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus promosi ini?')) return;
    await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    setAnnouncementSavedMsg('');

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_active: announcementActive,
          announcement_title: announcementTitle.trim(),
          announcement_text: announcementText.trim(),
        }),
      });
      setAnnouncementSavedMsg('Informasi penting di homepage berhasil diperbarui!');
      setTimeout(() => setAnnouncementSavedMsg(''), 3000);
    } catch {
      alert('Gagal menyimpan informasi penting');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Manajemen Promosi &amp; Informasi
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Atur banner diskon promosi, pengumuman penting homepage, dan info car wash
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Banner Promosi</span>
        </button>
      </div>

      {/* Homepage Important Announcement Section (Section 9.12) */}
      <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-gold/15 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="font-serif font-bold text-base text-cream">
              Informasi Penting di Homepage
            </h3>
          </div>
          {announcementSavedMsg && (
            <span className="text-xs font-bold text-green-400 animate-pulse">
              {announcementSavedMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive === '1'}
                onChange={(e) => setAnnouncementActive(e.target.checked ? '1' : '0')}
                className="accent-gold"
              />
              <span>Tampilkan Pengumuman di Homepage</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gold">Judul Pengumuman</label>
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Contoh: Promo Weekend & Layanan Express Car Detailing"
              className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gold">Teks Pengumuman</label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              rows={2}
              placeholder="Isi pengumuman yang akan dibaca pelanggan..."
              className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={savingAnnouncement}
            className="py-2.5 px-4 rounded-xl bg-gold text-navy-deep font-bold uppercase tracking-wider text-xs shadow-goldGlow hover:brightness-110"
          >
            {savingAnnouncement ? 'Menyimpan...' : 'Simpan Pengumuman Homepage'}
          </button>
        </form>
      </div>

      {/* Promotion Banners List */}
      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4">
        <h3 className="font-serif font-bold text-base text-cream">Daftar Banner Promosi Aktif</h3>

        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat promosi...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-gold/20 bg-navy-deep shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3">
                    <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gold text-navy-deep uppercase tracking-wider shadow">
                      {p.discount_type === 'percentage'
                        ? `Diskon ${p.discount_value}%`
                        : `Potongan Rp ${Number(p.discount_value).toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-cream">{p.title}</h4>
                  <p className="text-xs text-cream/70 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.is_active === 1
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {p.is_active === 1 ? 'Aktif' : 'Non-Aktif'}
                  </span>

                  <div className="space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/15"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promotion Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream shadow-luxury max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gold/15">
              <h3 className="font-serif font-bold text-base text-cream">
                {editingPromo ? 'Edit Promosi' : 'Tambah Promosi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Judul Promosi</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">URL Gambar Banner</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Nilai Diskon</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
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
                  Simpan Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  X,
  Upload,
  AlertCircle,
  Star,
  Flame,
  Tag,
  Loader2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | string>(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [kasirProductId, setKasirProductId] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [label, setLabel] = useState('');
  const [discountType, setDiscountType] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number | string>(0);
  const [variants, setVariants] = useState<{ name: string; price_difference: number }[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, catRes, addRes] = await Promise.all([
        fetch(`/api/products?includeDeleted=${includeDeleted}`).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/addons').then((r) => r.json()),
      ]);

      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) setCategories(catRes.categories);
      if (addRes.addons) setAddons(addRes.addons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [includeDeleted]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80');
    setIsFeatured(false);
    setIsAvailable(true);
    setIsDraft(false);
    setKasirProductId('');
    setSortOrder(products.length + 1);
    setLabel('');
    setDiscountType('');
    setDiscountValue(0);
    setVariants([]);
    setSelectedAddonIds([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id);
    setPrice(p.price);
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setIsFeatured(p.is_featured === 1);
    setIsAvailable(p.is_available === 1);
    setIsDraft(p.is_draft === 1);
    setKasirProductId(p.kasir_product_id || '');
    setSortOrder(p.sort_order || 0);
    setLabel(p.label || '');
    setDiscountType(p.discount_type || '');
    setDiscountValue(p.discount_value || 0);
    setVariants(p.variants || []);
    setSelectedAddonIds(p.addons ? p.addons.map((a: any) => a.id) : []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        setImageUrl(json.url);
      }
    } catch {
      alert('Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !categoryId || price === '') {
      setFormError('Nama, kategori, dan harga wajib diisi');
      return;
    }

    setFormSubmitting(true);

    const payload = {
      name: name.trim(),
      category_id: categoryId,
      price: Number(price),
      description,
      image_url: imageUrl,
      is_featured: isFeatured ? 1 : 0,
      is_available: isAvailable ? 1 : 0,
      is_draft: isDraft ? 1 : 0,
      kasir_product_id: kasirProductId || null,
      sort_order: Number(sortOrder || 0),
      label: label || null,
      discount_type: discountType || null,
      discount_value: Number(discountValue || 0),
      variants,
      addon_ids: selectedAddonIds,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan produk');

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan produk');
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleAvailability = async (productId: string) => {
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggleAvailability: true }),
    });
    fetchData();
  };

  const handleSoftDelete = async (productId: string) => {
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    setDeleteConfirmId(null);
    fetchData();
  };

  const handleRestore = async (productId: string) => {
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restore: true }),
    });
    fetchData();
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mDesc = p.description && p.description.toLowerCase().includes(q);
        if (!mName && !mDesc) return false;
      }
      return true;
    });
  }, [products, selectedCategory, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Manajemen Produk Menu
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Kelola daftar menu, varian, add-ons, diskon, dan harga cafe
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-gold/25 bg-navy-dark space-y-3 shadow-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu atau deskripsi..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream focus:outline-none focus:border-gold"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Include deleted checkbox */}
          <label className="flex items-center gap-2 text-xs text-cream/70 cursor-pointer select-none px-2">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="accent-gold"
            />
            <span>Tampilkan Arsip/Terhapus</span>
          </label>
        </div>
      </div>

      {/* Products Data Table (Section 8) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gold/15">
          <span className="text-xs text-cream/60">
            Ditemukan {filteredProducts.length} produk
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat data produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-cream/60">
            Tidak ada produk yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream/80">
              <thead className="bg-navy-deep text-gold uppercase tracking-wider text-[10px] border-b border-gold/20">
                <tr>
                  <th className="p-3">Foto</th>
                  <th className="p-3">Nama Menu</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">SKU Kasir</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Unggulan</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {filteredProducts.map((p) => {
                  const isDeleted = Boolean(p.deleted_at);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-navy-deep/40 transition-colors ${
                        isDeleted ? 'opacity-50 bg-red-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-navy-deep flex-shrink-0">
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-sm text-cream">{p.name}</span>
                          {p.label && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gold/20 text-gold border border-gold/30">
                              {p.label}
                            </span>
                          )}
                          {p.is_draft === 1 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Draft/Konfirmasi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-cream/60 line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      </td>
                      <td className="p-3 font-semibold text-gold">{p.category_name}</td>
                      <td className="p-3 font-extrabold text-cream">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-cream/60">
                        {p.kasir_product_id || '-'}
                      </td>
                      <td className="p-3">
                        {isDeleted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                            Diarsipkan
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleAvailability(p.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                              p.is_available === 1
                                ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                            }`}
                          >
                            {p.is_available === 1 ? 'Tersedia' : 'Habis'}
                          </button>
                        )}
                      </td>
                      <td className="p-3">
                        {p.is_featured === 1 ? (
                          <Star className="w-4 h-4 text-gold fill-gold" />
                        ) : (
                          <Star className="w-4 h-4 text-cream/20" />
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        {isDeleted ? (
                          <button
                            onClick={() => handleRestore(p.id)}
                            className="p-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/20"
                            title="Pulihkan Produk"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/15"
                              title="Edit Produk"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/15"
                              title="Arsipkan/Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog (Soft delete preservation) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream text-center shadow-luxury">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-cream">
                Arsipkan Produk Ini?
              </h3>
              <p className="text-xs text-cream/70 mt-1">
                Produk akan menggunakan soft delete sehingga riwayat transaksi lama tetap aman dan produk dapat dipulihkan kapan saja.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-gold/30 text-xs font-bold text-cream/80 hover:bg-gold/10"
              >
                Batal
              </button>
              <button
                onClick={() => handleSoftDelete(deleteConfirmId)}
                className="w-1/2 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:brightness-110"
              >
                Ya, Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Product Modal Form (Section 8) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-navy-dark border border-gold/30 rounded-3xl p-6 space-y-5 text-cream my-8 shadow-luxury max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gold/15">
              <h3 className="font-serif font-bold text-lg text-cream">
                {editingProduct ? 'Edit Produk Menu' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gold hover:text-gold-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Nasi Sop Buntut Asia"
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Kategori *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="42000"
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-gold">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi cita rasa menu..."
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2">
                <label className="font-bold uppercase tracking-wider text-gold flex items-center justify-between">
                  <span>Foto Produk</span>
                  {isUploading && <span className="text-gold animate-pulse">Mengunggah...</span>}
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-navy-deep border border-gold/20 flex-shrink-0">
                    {imageUrl && <Image src={imageUrl} alt="Preview" fill className="object-cover" />}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL gambar atau upload..."
                      className="w-full p-2 rounded-lg bg-navy-deep border border-gold/25 text-[11px] text-cream"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/30 bg-gold/10 text-gold text-[11px] font-bold cursor-pointer hover:bg-gold/20">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload dari Perangkat</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Flags: Featured, Available, Draft Price Confirmation */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <label className="p-2.5 rounded-xl border border-gold/20 bg-navy-deep flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Menu Unggulan</span>
                </label>

                <label className="p-2.5 rounded-xl border border-gold/20 bg-navy-deep flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Tersedia</span>
                </label>

                <label className="p-2.5 rounded-xl border border-gold/20 bg-navy-deep flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={(e) => setIsDraft(e.target.checked)}
                    className="accent-gold"
                  />
                  <span className="text-[10px]">Perlu Konfirmasi Harga</span>
                </label>
              </div>

              {/* Label & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Label Menu</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  >
                    <option value="">Tanpa Label</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Spicy">Spicy</option>
                    <option value="New">New</option>
                    <option value="Special Confirmation">Special Confirmation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-gold">Kode SKU Kasir</label>
                  <input
                    type="text"
                    value={kasirProductId}
                    onChange={(e) => setKasirProductId(e.target.value)}
                    placeholder="SKU-KOP-001"
                    className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Addons Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold uppercase tracking-wider text-gold">Hubungkan Add-ons</label>
                <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto p-2 bg-navy-deep rounded-xl border border-gold/20">
                  {addons.map((add) => {
                    const isChecked = selectedAddonIds.includes(add.id);
                    return (
                      <label key={add.id} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedAddonIds(selectedAddonIds.filter((id) => id !== add.id));
                            } else {
                              setSelectedAddonIds([...selectedAddonIds, add.id]);
                            }
                          }}
                          className="accent-gold"
                        />
                        <span className="truncate">{add.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 rounded-xl border border-gold/30 font-bold uppercase text-cream/80 hover:bg-gold/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-1/2 py-3 rounded-xl bg-gold text-navy-deep font-bold uppercase shadow-goldGlow hover:brightness-110 flex items-center justify-center gap-2"
                >
                  {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Produk</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Plus, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('cafe');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.gallery) setGallery(data.gallery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, image_url: imageUrl, category }),
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setImageUrl('');
      fetchGallery();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide">
            Galeri Suasana &amp; Car Wash
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Foto atmosfer European luxury cafe, car wash detailing bays, dan VIP lounge
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Galeri</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-cream/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Memuat galeri...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-gold/20 bg-navy-deep overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div className="relative h-44 w-full bg-navy-dark">
                  <Image src={g.image_url} alt={g.title} fill className="object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-navy-deep/80 text-gold border border-gold/30">
                    {g.category}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="font-serif font-bold text-sm text-cream">{g.title}</h4>
                  <p className="text-xs text-cream/60 line-clamp-2">{g.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-navy-dark border border-gold/30 rounded-2xl p-5 space-y-4 text-cream shadow-luxury">
            <div className="flex items-center justify-between pb-2 border-b border-gold/15">
              <h3 className="font-serif font-bold text-base text-cream">Tambah Foto Galeri</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">Judul Foto</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">URL Foto</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gold">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
                >
                  <option value="cafe">Cafe &amp; Dining</option>
                  <option value="carwash">Car Wash &amp; Detailing</option>
                  <option value="food">Makanan &amp; Minuman</option>
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
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Check, Loader2, CreditCard, Clock, Phone, MapPin, Instagram } from 'lucide-react';

export default function AdminSettingsPage() {
  const [taxRate, setTaxRate] = useState<number | string>(0.11);
  const [paymentMethods, setPaymentMethods] = useState<any>({
    cashier: true,
    qris: true,
    transfer: true,
    debit: true,
    credit: true,
  });
  const [cafeHours, setCafeHours] = useState('08:00 - 22:00 WIB');
  const [carwashHours, setCarwashHours] = useState('07:30 - 19:00 WIB');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [instagram, setInstagram] = useState('asiacarwashandcafe');
  const [mapsUrl, setMapsUrl] = useState('https://maps.app.goo.gl/1BwPD4VX9QfCVcxq7?g_st=ac');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.tax_rate !== undefined) setTaxRate(data.settings.tax_rate);
          if (data.settings.payment_methods) setPaymentMethods(data.settings.payment_methods);
          if (data.settings.cafe_hours) setCafeHours(data.settings.cafe_hours);
          if (data.settings.carwash_hours) setCarwashHours(data.settings.carwash_hours);
          if (data.settings.phone_number) setPhone(data.settings.phone_number);
          if (data.settings.instagram) setInstagram(data.settings.instagram);
          if (data.settings.maps_url) setMapsUrl(data.settings.maps_url);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tax_rate: String(taxRate),
          payment_methods: paymentMethods,
          cafe_hours: cafeHours,
          carwash_hours: carwashHours,
          phone_number: phone,
          instagram,
          maps_url: mapsUrl,
        }),
      });
      setSavedMsg('Pengaturan bisnis berhasil disimpan!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide flex items-center gap-2">
            <Settings className="w-6 h-6 text-gold" />
            <span>Pengaturan Bisnis (Owner Portal)</span>
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Pajak/layanan, metode pembayaran aktif, jam operasional, dan hotline
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs font-bold text-green-400 animate-pulse">{savedMsg}</span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl text-xs">
        {/* Tax & Service Rules (Section 12) */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream border-b border-gold/15 pb-2">
            Aturan Pajak &amp; Service Charge (Section 12)
          </h3>
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gold">
              Tarif Pajak &amp; Layanan (Default 11% / 0.11)
            </label>
            <input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
            />
            <p className="text-[11px] text-cream/50">
              Contoh: Masukkan 0.11 untuk 11% atau 0.10 untuk 10%. Perhitungan harga dilakukan oleh server.
            </p>
          </div>
        </div>

        {/* Payment Methods Toggle (Section 11) */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream border-b border-gold/15 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold" />
            <span>Metode Pembayaran yang Diizinkan Owner (Section 11)</span>
          </h3>

          <div className="space-y-2">
            {[
              { key: 'cashier', label: 'Bayar di Kasir (Cashier)', desc: 'Pelanggan membayar di meja kasir' },
              { key: 'qris', label: 'QRIS Digital (GoPay, OVO, Dana, BCA)', desc: 'Pembayaran instan scan QRIS' },
              { key: 'transfer', label: 'Transfer Bank (Virtual Account)', desc: 'BCA, Mandiri, BNI, BRI VA' },
              { key: 'debit', label: 'Kartu Debit', desc: 'EDC atau Gateway Debit' },
              { key: 'credit', label: 'Kartu Kredit (Visa/Mastercard)', desc: 'Credit card payment gateway' },
            ].map((pm) => (
              <label
                key={pm.key}
                className="p-3 rounded-xl border border-gold/20 bg-navy-deep flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-cream">{pm.label}</p>
                  <p className="text-[11px] text-cream/60">{pm.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(paymentMethods[pm.key])}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      [pm.key]: e.target.checked,
                    })
                  }
                  className="accent-gold w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Operating Hours & Hotline */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-3">
          <h3 className="font-serif font-bold text-base text-cream border-b border-gold/15 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <span>Jam Operasional &amp; Kontak Bisnis</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-gold">Jam Cafe</label>
              <input
                type="text"
                value={cafeHours}
                onChange={(e) => setCafeHours(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-gold">Jam Car Wash</label>
              <input
                type="text"
                value={carwashHours}
                onChange={(e) => setCarwashHours(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gold">Nomor Hotline WhatsApp</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-gold">Instagram Handle</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-gold">Google Maps URL</label>
              <input
                type="text"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-gold text-navy-deep font-bold uppercase tracking-wider shadow-goldGlow hover:brightness-110 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Semua Pengaturan</span>}
        </button>
      </form>
    </div>
  );
}

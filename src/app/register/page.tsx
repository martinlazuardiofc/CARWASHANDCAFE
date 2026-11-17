'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pendaftaran gagal');

      router.push('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-cream flex flex-col justify-center px-4 py-8">
      <div className="max-w-sm mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <AsiaLogo size="md" variant="gold" />
          <h1 className="font-serif font-bold text-xl text-cream tracking-wide">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-cream/70">
            Daftar untuk menikmati kemudahan pemesanan digital
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="p-5 rounded-2xl border border-gold/30 bg-navy-dark space-y-3.5 shadow-luxury">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Nomor WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-cream/70 border-t border-gold/15">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-gold font-bold hover:underline">
              Login di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AsiaLogo from '@/components/brand/AsiaLogo';
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('asiacarandwashcafe@gmail.com');
  const [password, setPassword] = useState('asiacafe1*');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Autentikasi administrator gagal');

      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Email atau password administrator salah');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep text-cream flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Background luxury gradient & subtle grid */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(212, 175, 106, 0.12) 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-md mx-auto w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <AsiaLogo size="lg" variant="gold" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </div>
          <p className="text-xs text-cream/70 font-sans">
            Sistem Digital Menu, Kasir &amp; Manajemen Bisnis
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="p-6 rounded-3xl border border-gold/30 bg-navy-dark/95 backdrop-blur-md space-y-4 shadow-luxury">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asiacarandwashcafe@gmail.com"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gold">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-navy-deep border border-gold/25 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Quick preset hint */}
          <div className="p-3 rounded-xl bg-navy-deep/60 border border-gold/20 text-[11px] text-cream/70 space-y-1">
            <p className="font-semibold text-gold flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kredensial Default:</span>
            </p>
            <p>Gmail: <code className="text-gold-light">asiacarandwashcafe@gmail.com</code></p>
            <p>Password: <code className="text-gold-light">asiacafe1*</code></p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-xs uppercase tracking-wider shadow-goldGlow hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-cream/50 hover:text-gold transition-colors">
            &larr; Kembali ke Website Pelanggan
          </Link>
        </div>
      </div>
    </div>
  );
}

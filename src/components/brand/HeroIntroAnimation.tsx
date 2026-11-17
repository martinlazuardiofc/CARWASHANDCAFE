'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AsiaLogo from './AsiaLogo';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface HeroIntroAnimationProps {
  forceShow?: boolean;
  onFinish?: () => void;
}

export default function HeroIntroAnimation({ forceShow = false, onFinish }: HeroIntroAnimationProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [step, setStep] = useState(0); // 0: initial, 1: logo, 2: tagline, 3: golden ornaments, 4: explore button ready

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !forceShow) {
      if (onFinish) onFinish();
      return;
    }

    // Check if seen before in session or local storage
    const hasSeen = sessionStorage.getItem('asia_intro_seen');
    if (!hasSeen || forceShow) {
      setIsVisible(true);

      const t1 = setTimeout(() => setStep(1), 300);   // Logo fade in
      const t2 = setTimeout(() => setStep(2), 1200);  // Tagline & details
      const t3 = setTimeout(() => setStep(3), 2000);  // Golden lines & luxury frame
      const t4 = setTimeout(() => setStep(4), 2700);  // Explore button pulse

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      if (onFinish) onFinish();
    }
  }, [forceShow, onFinish]);

  const handleDismiss = (destination?: string) => {
    setIsFadingOut(true);
    sessionStorage.setItem('asia_intro_seen', 'true');
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
      if (destination) {
        router.push(destination);
      }
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-6 py-10 bg-navy-deep text-cream overflow-hidden transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 35%, rgba(26, 54, 93, 0.45) 0%, rgba(8, 20, 38, 0.98) 75%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af6a' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Top Header: Skip Button */}
      <div className="w-full max-w-md flex justify-end">
        <button
          onClick={() => handleDismiss()}
          className="text-xs uppercase tracking-widest text-gold/70 hover:text-gold flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/20 bg-navy-dark/40 backdrop-blur-sm transition-all"
        >
          <span>Lewati</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Animated Brand Showcase */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm text-center my-auto">
        {/* Decorative European Luxury Frame with subtle gold glow */}
        <div
          className={`relative p-8 rounded-2xl border border-gold/30 bg-navy-dark/60 backdrop-blur-md shadow-luxury transition-all duration-1000 ${
            step >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Corner gold ornaments */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gold" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-gold" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-gold" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gold" />

          {/* Logo with star and car icon */}
          <div className="mb-4 transform transition-all duration-700">
            <AsiaLogo size="lg" variant="gold" />
          </div>

          {/* Tagline */}
          <div
            className={`transition-all duration-700 delay-200 ${
              step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="font-serif italic text-gold-light text-base tracking-wide mt-2">
              &ldquo;A Taste of Comfort, A Touch of Luxury.&rdquo;
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-3" />
            <p className="text-xs text-cream/70 font-sans tracking-wider uppercase">
              European Luxury Cafe Meets Modern Automotive Lounge
            </p>
          </div>

          {/* Gold Laurel Accent */}
          <div
            className={`mt-4 flex items-center justify-center gap-2 text-gold transition-opacity duration-700 ${
              step >= 3 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            <span className="text-[10px] tracking-widest text-gold uppercase">Digital Ordering Experience</span>
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div
        className={`w-full max-w-sm flex flex-col items-center gap-3 transition-all duration-700 ${
          step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <button
          onClick={() => handleDismiss('/menu')}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-deep font-sans font-bold text-sm tracking-wider uppercase shadow-goldGlow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Explore Our Menu</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => handleDismiss('/')}
          className="text-xs text-cream/60 hover:text-gold transition-colors py-1"
        >
          Kunjungi Beranda Utama
        </button>
      </div>
    </div>
  );
}

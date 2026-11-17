'use client';

import React from 'react';

interface AsiaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'cream' | 'navy';
  showTagline?: boolean;
  className?: string;
}

export default function AsiaLogo({
  size = 'md',
  variant = 'gold',
  showTagline = false,
  className = '',
}: AsiaLogoProps) {
  const isGold = variant === 'gold';
  const primaryColor = isGold ? '#D4AF6A' : variant === 'cream' ? '#F5E9C8' : '#0F2342';
  const secondaryColor = isGold ? '#F5E9C8' : '#D4AF6A';

  const scaleMap = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-28',
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        className={`${scaleMap[size]} w-auto transition-transform duration-300 hover:scale-105`}
        viewBox="0 0 280 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Luxury Car Silhouette */}
        <g opacity="0.95">
          {/* Streamlined luxury GT car outline */}
          <path
            d="M 60 40 Q 80 32 105 24 Q 130 18 155 18 Q 185 18 205 27 Q 220 33 235 40 C 242 41 248 44 246 48 C 244 51 235 52 225 52 C 220 44 210 44 205 52 L 95 52 C 90 44 80 44 75 52 C 65 52 56 50 54 47 C 52 44 55 41 60 40 Z"
            fill={primaryColor}
            opacity="0.25"
          />
          <path
            d="M 62 42 C 78 35 105 25 140 22 C 175 22 205 28 226 38 L 244 46 C 246 47 242 49 232 49 C 228 42 216 42 212 49 L 98 49 C 94 42 82 42 78 49 C 68 49 60 47 62 42 Z"
            stroke={primaryColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Car wheels */}
          <circle cx="88" cy="49" r="6" fill="#0F2342" stroke={primaryColor} strokeWidth="2" />
          <circle cx="220" cy="49" r="6" fill="#0F2342" stroke={primaryColor} strokeWidth="2" />
          <circle cx="88" cy="49" r="2.5" fill={primaryColor} />
          <circle cx="220" cy="49" r="2.5" fill={primaryColor} />
          {/* Aerodynamic windshield accent */}
          <path
            d="M 120 28 Q 145 24 175 24 Q 192 26 202 33"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* ASIA Typographic Brand Mark */}
        <text
          x="140"
          y="84"
          textAnchor="middle"
          fill={primaryColor}
          fontFamily="Playfair Display, Georgia, serif"
          fontSize="38"
          fontWeight="800"
          letterSpacing="0.12em"
        >
          ASIA
        </text>

        {/* Small Sparkling Luxury Star at the top-right of ASIA */}
        <g transform="translate(196, 56) scale(0.9)">
          <path
            d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z"
            fill={secondaryColor}
          />
          <circle cx="10" cy="10" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Luxury Laurel / Leaf Decorative Divider */}
        <g opacity="0.85">
          <line x1="30" y1="94" x2="85" y2="94" stroke={primaryColor} strokeWidth="1" strokeDasharray="2 1" />
          {/* Left leaf */}
          <path d="M 88 94 Q 93 91 98 94 Q 93 97 88 94 Z" fill={primaryColor} />
          {/* Center diamond */}
          <polygon points="140,91 143,94 140,97 137,94" fill={primaryColor} />
          {/* Right leaf */}
          <path d="M 182 94 Q 187 91 192 94 Q 187 97 182 94 Z" fill={primaryColor} />
          <line x1="195" y1="94" x2="250" y2="94" stroke={primaryColor} strokeWidth="1" strokeDasharray="2 1" />
        </g>

        {/* CAR WASH & CAFE Subtitle */}
        <text
          x="140"
          y="106"
          textAnchor="middle"
          fill={secondaryColor}
          fontFamily="Plus Jakarta Sans, Inter, sans-serif"
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="0.32em"
          opacity="0.95"
        >
          CAR WASH &amp; CAFE
        </text>
      </svg>

      {showTagline && (
        <span className="text-xs tracking-widest text-gold-light/80 font-sans italic mt-1 text-center">
          A Taste of Comfort, A Touch of Luxury
        </span>
      )}
    </div>
  );
}

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: "#081426",
          dark: "#0F2342",
          DEFAULT: "#0F2342",
          light: "#1A365D",
          soft: "#1E3A8A",
        },
        gold: {
          light: "#EAD4A8",
          DEFAULT: "#D4AF6A",
          dark: "#B88E45",
          antique: "#C5A059",
        },
        cream: {
          DEFAULT: "#F5E9C8",
          light: "#FAF4E6",
          dark: "#E8D8AF",
        },
        coffee: {
          dark: "#38271F",
          DEFAULT: "#38271F",
          medium: "#684832",
          light: "#8B654A",
        },
        warmCream: "#F5EBDD",
      },
      fontFamily: {
        serif: ["Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(15, 35, 66, 0.4), 0 0 20px 2px rgba(212, 175, 106, 0.15)",
        goldGlow: "0 0 25px rgba(212, 175, 106, 0.25)",
        card: "0 4px 20px -2px rgba(8, 20, 38, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 3s infinite ease-in-out",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

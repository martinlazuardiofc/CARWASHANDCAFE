import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'ASIA Car Wash & Cafe — A Taste of Comfort, A Touch of Luxury',
  description: 'Digital menu, online ordering, and luxury automotive lounge. Nikmati santapan cafe Eropa premium sembari kendaraan Anda dimanjakan dengan car wash detailing terbaik.',
  keywords: ['ASIA Car Wash & Cafe', 'Cafe Jakarta', 'Car Wash Detailing', 'Digital Menu', 'Online Ordering'],
  authors: [{ name: 'ASIA Car Wash & Cafe' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F2342',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-navy text-cream antialiased selection:bg-gold selection:text-navy-deep">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

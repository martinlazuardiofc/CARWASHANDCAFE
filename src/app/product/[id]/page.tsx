'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductDetailSheet from '@/components/customer/ProductDetailSheet';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';
import FloatingCart from '@/components/customer/FloatingCart';
import { Loader2 } from 'lucide-react';

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <div className="min-h-screen bg-navy text-cream">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : (
        <ProductDetailSheet
          product={product}
          isOpen={true}
          onClose={() => router.push('/menu')}
        />
      )}

      <FloatingCart />
      <CustomerBottomNav />
    </div>
  );
}

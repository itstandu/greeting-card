'use client';

import { useParams } from 'next/navigation';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { useProductDetail } from '@/hooks/use-product-detail';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { product, relatedProducts, loading, error } = useProductDetail(slug);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      loading={loading}
      error={error}
    />
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductDetailClient } from './ProductDetailClient';
import { useAuth } from '@/hooks/use-auth';
import { getProductBySlug, getProducts } from '@/services/product.service';
import { Product } from '@/types';

// Client component - fetches data after navigation
export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(false);
        const response = await getProductBySlug(slug, isAuthenticated);
        const productData = response.data;

        if (!productData) {
          setError(true);
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Get related products from same category
        if (productData.category) {
          try {
            const relatedResponse = await getProducts(
              {
                categoryId: productData.category.id,
                isActive: true,
                page: 1,
                size: 8,
              },
              isAuthenticated,
            );
            setRelatedProducts(relatedResponse.data?.products || []);
          } catch {
            // Ignore related products error
            setRelatedProducts([]);
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, isAuthenticated]);

  if (loading || !product) {
    return <ProductDetailClient product={null} relatedProducts={[]} loading={true} error={error} />;
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      loading={false}
      error={false}
    />
  );
}

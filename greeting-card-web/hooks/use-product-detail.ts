import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { getProductBySlug, getProducts } from '@/services/product.service';
import type { Product } from '@/types';

interface UseProductDetailReturn {
  product: Product | null;
  relatedProducts: Product[];
  loading: boolean;
  error: boolean;
}

export function useProductDetail(slug: string | undefined): UseProductDetailReturn {
  const { isAuthenticated, hasCheckedAuth } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const lastFetchedRef = useRef<{ slug: string | undefined; isAuthenticated: boolean }>({
    slug: undefined,
    isAuthenticated: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      if (!hasCheckedAuth) return;

      if (
        lastFetchedRef.current.slug === slug &&
        lastFetchedRef.current.isAuthenticated === isAuthenticated
      ) {
        return;
      }

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

        lastFetchedRef.current = { slug, isAuthenticated };

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
  }, [slug, isAuthenticated, hasCheckedAuth]);

  return {
    product,
    relatedProducts,
    loading,
    error,
  };
}

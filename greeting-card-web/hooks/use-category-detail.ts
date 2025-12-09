import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { getAllCategories, getCategoryBySlug } from '@/services';
import { getProducts } from '@/services/product.service';
import type { Category, Product } from '@/types';

interface UseCategoryDetailReturn {
  category: Category | null;
  products: Product[];
  allCategories: Category[];
  loading: boolean;
  error: boolean;
}

export function useCategoryDetail(slug: string | undefined): UseCategoryDetailReturn {
  const { isAuthenticated, hasCheckedAuth } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
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

        const categoryResponse = await getCategoryBySlug(slug);
        const categoryData = categoryResponse.data;

        if (!categoryData) {
          setError(true);
          setLoading(false);
          return;
        }

        lastFetchedRef.current = { slug, isAuthenticated };

        setCategory(categoryData);

        // Fetch products and all categories in parallel
        try {
          const [productsResponse, categoriesResponse] = await Promise.all([
            getProducts(
              {
                categoryId: categoryData.id,
                isActive: true,
                page: 1,
                size: 100,
              },
              isAuthenticated,
            ),
            getAllCategories(),
          ]);

          setProducts(productsResponse.data?.products || []);
          setAllCategories(categoriesResponse.data || []);
        } catch {
          // Ignore errors, show empty products
          setProducts([]);
          setAllCategories([]);
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
    category,
    products,
    allCategories,
    loading,
    error,
  };
}

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryDetailClient } from './CategoryDetailClient';
import { useAuth } from '@/hooks/use-auth';
import { getAllCategories, getCategoryBySlug } from '@/services';
import { getProducts } from '@/services/product.service';
import type { Category, Product } from '@/types';

// Client component - fetches data after navigation
export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isAuthenticated } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

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
  }, [slug, isAuthenticated]);

  if (loading || !category) {
    return (
      <CategoryDetailClient
        category={null}
        products={[]}
        allCategories={[]}
        loading={true}
        error={error}
      />
    );
  }

  return (
    <CategoryDetailClient
      category={category}
      products={products}
      allCategories={allCategories}
      loading={false}
      error={error}
    />
  );
}

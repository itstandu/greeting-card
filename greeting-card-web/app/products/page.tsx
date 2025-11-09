'use client';

import { useEffect, useState } from 'react';
import { ProductsPageClient } from './ProductsPageClient';
import { useAuth } from '@/hooks/use-auth';
import { getAllCategories, getProducts } from '@/services';
import type { Category, Product } from '@/types';

// Client component - fetches data after navigation
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts({ isActive: true, size: 100 }, isAuthenticated),
          getAllCategories(),
        ]);
        setProducts(productsResponse.data?.products || []);
        setCategories(categoriesResponse.data || []);
      } catch {
        // Show empty state on error
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return <ProductsPageClient products={products} categories={categories} loading={loading} />;
}

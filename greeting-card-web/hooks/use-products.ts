import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { getProducts } from '@/services';
import type { PaginationResponse, Product, ProductFilters as ProductFiltersType } from '@/types';

interface UseProductsOptions {
  filters: {
    page: number;
    size: number;
    search: string;
    sort: string;
    categories: number[];
    featured: boolean;
    inStock: boolean;
    priceMin: number;
    priceMax: number;
    categoriesKey: string;
    priceRangeKey: string;
  };
  initialProducts?: Product[];
  initialPagination?: PaginationResponse;
}

interface UseProductsReturn {
  products: Product[];
  pagination: PaginationResponse;
  loading: boolean;
  error: string | null;
}

export function useProducts({
  filters,
  initialProducts = [],
  initialPagination,
}: UseProductsOptions): UseProductsReturn {
  const { isAuthenticated, hasCheckedAuth } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationResponse>(
    initialPagination || { page: 1, size: 12, total: 0, totalPages: 0 },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedRef = useRef<{
    filtersKey: string;
    isAuthenticated: boolean;
  }>({
    filtersKey: '',
    isAuthenticated: false,
  });

  // Map sortBy to API sortBy and sortDir
  const getSortParams = (sortBy: string): { sortBy?: string; sortDir?: 'asc' | 'desc' } => {
    switch (sortBy) {
      case 'price-asc':
        return { sortBy: 'price', sortDir: 'asc' };
      case 'price-desc':
        return { sortBy: 'price', sortDir: 'desc' };
      case 'name-asc':
        return { sortBy: 'name', sortDir: 'asc' };
      case 'name-desc':
        return { sortBy: 'name', sortDir: 'desc' };
      case 'oldest':
        return { sortBy: 'createdAt', sortDir: 'asc' };
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortDir: 'desc' };
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      if (!hasCheckedAuth) return;

      // Create a unique key for filters (excluding isAuthenticated)
      const filtersKey = JSON.stringify({
        page: filters.page,
        size: filters.size,
        search: filters.search,
        sort: filters.sort,
        categoriesKey: filters.categoriesKey,
        featured: filters.featured,
        inStock: filters.inStock,
        priceRangeKey: filters.priceRangeKey,
      });

      // Skip if filters and isAuthenticated haven't changed
      if (
        lastFetchedRef.current.filtersKey === filtersKey &&
        lastFetchedRef.current.isAuthenticated === isAuthenticated
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Parse selectedCategories from key
        const selectedCategoriesArray = filters.categoriesKey
          ? filters.categoriesKey.split(',').map(Number)
          : [];

        // Parse priceRange from key
        const [priceMin, priceMax] = filters.priceRangeKey.split(',').map(Number);

        const sortParams = getSortParams(filters.sort);
        const categoryId =
          selectedCategoriesArray.length === 1 ? selectedCategoriesArray[0] : undefined;
        const apiFilters: ProductFiltersType = {
          page: filters.page,
          size: filters.size,
          isActive: true,
          search: filters.search || undefined,
          categoryId,
          isFeatured: filters.featured || undefined,
          ...sortParams,
        };

        lastFetchedRef.current = { filtersKey, isAuthenticated };

        const productsResponse = await getProducts(apiFilters, isAuthenticated);

        if (cancelled) return;

        let fetchedProducts = productsResponse.data?.products || [];

        // Apply client-side filters that API doesn't support
        // Price range filter
        fetchedProducts = fetchedProducts.filter(p => p.price >= priceMin && p.price <= priceMax);

        // Multiple categories filter (API only supports single categoryId)
        if (selectedCategoriesArray.length > 1) {
          fetchedProducts = fetchedProducts.filter(p =>
            selectedCategoriesArray.includes(p.category?.id),
          );
        }

        // In stock filter
        if (filters.inStock) {
          fetchedProducts = fetchedProducts.filter(p => p.stock > 0);
        }

        setProducts(fetchedProducts);
        if (productsResponse.data?.pagination) {
          setPagination(productsResponse.data.pagination);
        }
      } catch (err) {
        if (cancelled) return;
        const errorMessage =
          err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm';
        setError(errorMessage);
        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    filters.page,
    filters.size,
    filters.search,
    filters.sort,
    filters.categoriesKey,
    filters.featured,
    filters.inStock,
    filters.priceRangeKey,
    isAuthenticated,
    hasCheckedAuth,
  ]);

  // Reset to page 1 when filters change (except page itself)
  const prevFilters = useRef({
    search: filters.search,
    categories: filters.categoriesKey,
    sort: filters.sort,
    featured: filters.featured,
    priceRange: filters.priceRangeKey,
    inStock: filters.inStock,
    size: filters.size,
  });

  useEffect(() => {
    const currentFilters = {
      search: filters.search,
      categories: filters.categoriesKey,
      sort: filters.sort,
      featured: filters.featured,
      priceRange: filters.priceRangeKey,
      inStock: filters.inStock,
      size: filters.size,
    };

    const filtersChanged =
      prevFilters.current.search !== currentFilters.search ||
      prevFilters.current.categories !== currentFilters.categories ||
      prevFilters.current.sort !== currentFilters.sort ||
      prevFilters.current.featured !== currentFilters.featured ||
      prevFilters.current.priceRange !== currentFilters.priceRange ||
      prevFilters.current.inStock !== currentFilters.inStock ||
      prevFilters.current.size !== currentFilters.size;

    if (filtersChanged && filters.page !== 1) {
      // This will be handled by the parent component
    }

    prevFilters.current = currentFilters;
  }, [filters]);

  return {
    products,
    pagination,
    loading,
    error,
  };
}

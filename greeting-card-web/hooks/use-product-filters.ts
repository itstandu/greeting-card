import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from './use-debounce';
import type { ViewMode } from '@/components/ui/product-filters';

interface ProductFiltersState {
  page: number;
  size: number;
  search: string;
  sort: string;
  view: ViewMode;
  categories: number[];
  featured: boolean;
  inStock: boolean;
  priceMin: number;
  priceMax: number;
}

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInitialStateFromUrl = useCallback((): ProductFiltersState => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const size = parseInt(searchParams.get('size') || '12', 10);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const view = (searchParams.get('view') || 'grid') as ViewMode;
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam
      ? categoriesParam.split(',').map(Number).filter(Boolean)
      : [];
    const featured = searchParams.get('featured') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    const priceMin = parseInt(searchParams.get('priceMin') || '0', 10);
    const priceMax = parseInt(searchParams.get('priceMax') || '1000000', 10);

    return {
      page,
      size,
      search,
      sort,
      view,
      categories,
      featured,
      inStock,
      priceMin,
      priceMax,
    };
  }, [searchParams]);

  const urlState = getInitialStateFromUrl();

  const [searchQuery, setSearchQuery] = useState(urlState.search);
  const [sortBy, setSortBy] = useState(urlState.sort);
  const [viewMode, setViewMode] = useState<ViewMode>(urlState.view);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(urlState.categories);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    urlState.priceMin,
    urlState.priceMax,
  ]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(urlState.featured);
  const [showInStockOnly, setShowInStockOnly] = useState(urlState.inStock);
  const [currentPage, setCurrentPage] = useState(urlState.page);
  const [itemsPerPage, setItemsPerPage] = useState(urlState.size);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  const debouncedSelectedCategories = useDebounce(selectedCategories, 300);

  // Sync state with URL when URL changes (browser back/forward)
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    const urlState = getInitialStateFromUrl();

    if (urlState.page !== currentPage) setCurrentPage(urlState.page);
    if (urlState.size !== itemsPerPage) setItemsPerPage(urlState.size);
    if (urlState.search !== searchQuery) setSearchQuery(urlState.search);
    if (urlState.sort !== sortBy) setSortBy(urlState.sort);
    if (urlState.view !== viewMode) setViewMode(urlState.view);
    const currentCategoriesKey = selectedCategories.sort((a, b) => a - b).join(',');
    const urlCategoriesKey = urlState.categories.sort((a, b) => a - b).join(',');
    if (urlCategoriesKey !== currentCategoriesKey) {
      setSelectedCategories(urlState.categories);
    }
    if (urlState.priceMin !== priceRange[0] || urlState.priceMax !== priceRange[1]) {
      setPriceRange([urlState.priceMin, urlState.priceMax]);
    }
    if (urlState.featured !== showFeaturedOnly) setShowFeaturedOnly(urlState.featured);
    if (urlState.inStock !== showInStockOnly) setShowInStockOnly(urlState.inStock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString]);

  const updateUrl = useCallback(
    (updates: Partial<ProductFiltersState>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete('page');
        } else {
          params.set('page', updates.page.toString());
        }
      }
      if (updates.size !== undefined) {
        if (updates.size === 12) {
          params.delete('size');
        } else {
          params.set('size', updates.size.toString());
        }
      }
      if (updates.search !== undefined) {
        if (updates.search === '') {
          params.delete('search');
        } else {
          params.set('search', updates.search);
        }
      }
      if (updates.sort !== undefined) {
        if (updates.sort === 'newest') {
          params.delete('sort');
        } else {
          params.set('sort', updates.sort);
        }
      }
      if (updates.view !== undefined) {
        if (updates.view === 'grid') {
          params.delete('view');
        } else {
          params.set('view', updates.view);
        }
      }
      if (updates.categories !== undefined) {
        if (updates.categories.length === 0) {
          params.delete('categories');
        } else {
          params.set('categories', updates.categories.sort((a, b) => a - b).join(','));
        }
      }
      if (updates.featured !== undefined) {
        if (!updates.featured) {
          params.delete('featured');
        } else {
          params.set('featured', 'true');
        }
      }
      if (updates.inStock !== undefined) {
        if (!updates.inStock) {
          params.delete('inStock');
        } else {
          params.set('inStock', 'true');
        }
      }
      if (updates.priceMin !== undefined) {
        if (updates.priceMin === 0) {
          params.delete('priceMin');
        } else {
          params.set('priceMin', updates.priceMin.toString());
        }
      }
      if (updates.priceMax !== undefined) {
        if (updates.priceMax === 1000000) {
          params.delete('priceMax');
        } else {
          params.set('priceMax', updates.priceMax.toString());
        }
      }

      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounce URL updates for price range and categories
  useEffect(() => {
    const urlState = getInitialStateFromUrl();
    if (
      debouncedPriceRange[0] !== urlState.priceMin ||
      debouncedPriceRange[1] !== urlState.priceMax
    ) {
      updateUrl({
        priceMin: debouncedPriceRange[0],
        priceMax: debouncedPriceRange[1],
        page: 1,
      });
    }
  }, [debouncedPriceRange, updateUrl, getInitialStateFromUrl]);

  useEffect(() => {
    const urlState = getInitialStateFromUrl();
    const urlCategoriesKey = [...urlState.categories].sort((a, b) => a - b).join(',');
    const debouncedCategoriesKey = [...debouncedSelectedCategories].sort((a, b) => a - b).join(',');
    if (urlCategoriesKey !== debouncedCategoriesKey) {
      updateUrl({
        categories: debouncedSelectedCategories,
        page: 1,
      });
    }
  }, [debouncedSelectedCategories, updateUrl, getInitialStateFromUrl]);

  const updateSearchQuery = useCallback(
    (value: string) => {
      setSearchQuery(value);
      updateUrl({ search: value, page: 1 });
    },
    [updateUrl],
  );

  const updateSortBy = useCallback(
    (value: string) => {
      setSortBy(value);
      updateUrl({ sort: value, page: 1 });
    },
    [updateUrl],
  );

  const updateViewMode = useCallback(
    (value: ViewMode) => {
      setViewMode(value);
      updateUrl({ view: value });
    },
    [updateUrl],
  );

  const updateSelectedCategories = useCallback((value: number[]) => {
    setSelectedCategories(value);
  }, []);

  const updatePriceRange = useCallback((value: [number, number]) => {
    setPriceRange(value);
  }, []);

  const updateShowFeaturedOnly = useCallback(
    (value: boolean) => {
      setShowFeaturedOnly(value);
      updateUrl({ featured: value, page: 1 });
    },
    [updateUrl],
  );

  const updateShowInStockOnly = useCallback(
    (value: boolean) => {
      setShowInStockOnly(value);
      updateUrl({ inStock: value, page: 1 });
    },
    [updateUrl],
  );

  const updateCurrentPage = useCallback(
    (value: number) => {
      setCurrentPage(value);
      updateUrl({ page: value });
    },
    [updateUrl],
  );

  const updateItemsPerPage = useCallback(
    (value: number) => {
      setItemsPerPage(value);
      updateUrl({ size: value, page: 1 });
    },
    [updateUrl],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([0, 1000000]);
    setShowFeaturedOnly(false);
    setShowInStockOnly(false);
    setSearchQuery('');

    updateUrl({
      categories: [],
      priceMin: 0,
      priceMax: 1000000,
      featured: false,
      inStock: false,
      search: '',
      page: 1,
    });
  }, [updateUrl]);

  // Memoize keys for product fetching
  const selectedCategoriesKey = useMemo(
    () => [...debouncedSelectedCategories].sort((a, b) => a - b).join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSelectedCategories.join(',')],
  );

  const priceRangeKey = useMemo(
    () => `${debouncedPriceRange[0]},${debouncedPriceRange[1]}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedPriceRange[0], debouncedPriceRange[1]],
  );

  return {
    // State
    searchQuery,
    sortBy,
    viewMode,
    selectedCategories,
    priceRange,
    showFeaturedOnly,
    showInStockOnly,
    currentPage,
    itemsPerPage,
    // Debounced values
    debouncedSearch,
    debouncedPriceRange,
    debouncedSelectedCategories,
    selectedCategoriesKey,
    priceRangeKey,
    // Setters
    updateSearchQuery,
    updateSortBy,
    updateViewMode,
    updateSelectedCategories,
    updatePriceRange,
    updateShowFeaturedOnly,
    updateShowInStockOnly,
    updateCurrentPage,
    updateItemsPerPage,
    handleClearFilters,
  };
}

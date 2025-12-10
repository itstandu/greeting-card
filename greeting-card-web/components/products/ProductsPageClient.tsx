'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ProductCard,
  ProductCardSkeleton,
  ProductListItem,
  ProductListItemSkeleton,
} from '@/components/products';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PromoBanner, TrustBadges } from '@/components/ui/decorative-elements';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { ProductFilters, ViewMode } from '@/components/ui/product-filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { cn, formatCurrency } from '@/lib/utils';
import { getAllCategories, getProducts } from '@/services';
import { addToCart as addToCartApi } from '@/services/cart.service';
import type {
  Category,
  PaginationResponse,
  Product,
  ProductFilters as ProductFiltersType,
} from '@/types';
import {
  ArrowRight,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Filter,
  FolderOpen,
  Grid3X3,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react';

interface ProductsPageClientProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  initialPagination?: PaginationResponse;
}

// Stats for visual appeal
const pageStats = {
  totalSold: '5,000+',
  happyCustomers: '10,000+',
};

export function ProductsPageClient({
  initialProducts = [],
  initialCategories = [],
  initialPagination,
}: ProductsPageClientProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use ref to store toast to avoid dependency issues
  const toastRef = React.useRef(toast);
  React.useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Initialize state from URL params
  const getInitialStateFromUrl = useCallback(() => {
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

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [pagination, setPagination] = useState<PaginationResponse>(
    initialPagination || { page: 1, size: 12, total: 0, totalPages: 0 },
  );
  const [loading, setLoading] = useState(initialProducts.length === 0);
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(urlState.page);
  const [itemsPerPage, setItemsPerPage] = useState(urlState.size);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Debounce price range to avoid too many API calls while dragging slider
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Debounce category selections to avoid too many API calls when clicking multiple checkboxes
  const debouncedSelectedCategories = useDebounce(selectedCategories, 300);

  // Handle add to cart
  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!product.isActive || product.stock <= 0) {
        toast({
          title: 'Không thể thêm vào giỏ',
          description: 'Sản phẩm này hiện không có sẵn.',
          variant: 'destructive',
        });
        return;
      }

      try {
        if (isAuthenticated) {
          // Add to server cart
          await addToCartApi({ productId: product.id, quantity: 1 });
        } else {
          // Add to local cart
          const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
          cartStorage.addItem(
            {
              productId: product.id,
              productName: product.name,
              productSlug: product.slug,
              productImage: primaryImage?.imageUrl || '',
              price: product.price,
              stock: product.stock,
            },
            1,
          );
        }

        // Dispatch cart changed event
        window.dispatchEvent(new Event('cart-changed'));

        toast({
          title: 'Đã thêm vào giỏ hàng',
          description: product.name,
        });
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast({
          title: 'Lỗi',
          description: errorMessage || 'Không thể thêm vào giỏ hàng',
          variant: 'destructive',
        });
      }
    },
    [isAuthenticated, toast],
  );

  // Map sortBy to API sortBy and sortDir
  const getSortParams = useCallback(
    (sortBy: string): { sortBy?: string; sortDir?: 'asc' | 'desc' } => {
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
    },
    [],
  );

  // Fetch categories only once on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await getAllCategories();
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch {
        // Silently fail, categories are not critical
      }
    };

    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length]);

  // Sync state with URL when URL changes (browser back/forward)
  // Only sync when searchParams actually change, not when state changes
  const searchParamsString = searchParams.toString();
  React.useEffect(() => {
    const urlState = getInitialStateFromUrl();

    // Only update if different to avoid loops
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

  // Memoize debounced selectedCategories string key to avoid unnecessary re-renders
  const selectedCategoriesKey = useMemo(
    () => [...debouncedSelectedCategories].sort((a, b) => a - b).join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSelectedCategories.join(',')],
  );

  // Memoize debounced priceRange string key to avoid unnecessary re-renders
  const priceRangeKey = useMemo(
    () => `${debouncedPriceRange[0]},${debouncedPriceRange[1]}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedPriceRange[0], debouncedPriceRange[1]],
  );

  // Update URL when filters change
  const updateUrl = useCallback(
    (updates: {
      page?: number;
      size?: number;
      search?: string;
      sort?: string;
      view?: ViewMode;
      categories?: number[];
      featured?: boolean;
      inStock?: boolean;
      priceMin?: number;
      priceMax?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove params
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
  React.useEffect(() => {
    const urlState = getInitialStateFromUrl();
    // Only update URL if debounced values differ from URL state
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

  React.useEffect(() => {
    const urlState = getInitialStateFromUrl();
    const urlCategoriesKey = [...urlState.categories].sort((a, b) => a - b).join(',');
    const debouncedCategoriesKey = [...debouncedSelectedCategories].sort((a, b) => a - b).join(',');
    // Only update URL if debounced values differ from URL state
    if (urlCategoriesKey !== debouncedCategoriesKey) {
      updateUrl({
        categories: debouncedSelectedCategories,
        page: 1,
      });
    }
  }, [debouncedSelectedCategories, updateUrl, getInitialStateFromUrl]);

  // Fetch products when filters change
  React.useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        // Parse selectedCategories from key
        const selectedCategoriesArray = selectedCategoriesKey
          ? selectedCategoriesKey.split(',').map(Number)
          : [];

        // Parse priceRange from key
        const [priceMin, priceMax] = priceRangeKey.split(',').map(Number);

        const sortParams = getSortParams(sortBy);
        const categoryId =
          selectedCategoriesArray.length === 1 ? selectedCategoriesArray[0] : undefined;
        const filters: ProductFiltersType = {
          page: currentPage,
          size: itemsPerPage,
          isActive: true,
          search: debouncedSearch || undefined,
          categoryId,
          isFeatured: showFeaturedOnly || undefined,
          ...sortParams,
        };

        const productsResponse = await getProducts(filters, isAuthenticated);

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
        if (showInStockOnly) {
          fetchedProducts = fetchedProducts.filter(p => p.stock > 0);
        }

        setProducts(fetchedProducts);
        if (productsResponse.data?.pagination) {
          setPagination(productsResponse.data.pagination);
        }
      } catch (error: unknown) {
        if (cancelled) return;

        const errorMessage =
          error instanceof Error ? error.message : 'Không thể tải danh sách sản phẩm';
        toastRef.current({
          title: 'Lỗi',
          description: errorMessage,
          variant: 'destructive',
        });
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
    currentPage,
    itemsPerPage,
    debouncedSearch,
    selectedCategoriesKey,
    sortBy,
    showFeaturedOnly,
    showInStockOnly,
    priceRangeKey,
    isAuthenticated,
    getSortParams,
  ]);

  // Wrapper functions to update state and URL
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
    // URL update is handled by debounced useEffect
  }, []);

  const updatePriceRange = useCallback((value: [number, number]) => {
    setPriceRange(value);
    // URL update is handled by debounced useEffect
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

  // Reset to page 1 when filters change (except page itself)
  const prevFilters = React.useRef({
    debouncedSearch,
    selectedCategories: selectedCategories.join(','),
    sortBy,
    showFeaturedOnly,
    priceRange: priceRange.join(','),
    showInStockOnly,
    itemsPerPage,
  });

  React.useEffect(() => {
    const currentFilters = {
      debouncedSearch,
      selectedCategories: selectedCategories.join(','),
      sortBy,
      showFeaturedOnly,
      priceRange: priceRange.join(','),
      showInStockOnly,
      itemsPerPage,
    };

    const filtersChanged =
      prevFilters.current.debouncedSearch !== currentFilters.debouncedSearch ||
      prevFilters.current.selectedCategories !== currentFilters.selectedCategories ||
      prevFilters.current.sortBy !== currentFilters.sortBy ||
      prevFilters.current.showFeaturedOnly !== currentFilters.showFeaturedOnly ||
      prevFilters.current.priceRange !== currentFilters.priceRange ||
      prevFilters.current.showInStockOnly !== currentFilters.showInStockOnly ||
      prevFilters.current.itemsPerPage !== currentFilters.itemsPerPage;

    if (filtersChanged && currentPage !== 1) {
      updateCurrentPage(1);
    }

    prevFilters.current = currentFilters;
  }, [
    debouncedSearch,
    selectedCategories,
    sortBy,
    showFeaturedOnly,
    priceRange,
    showInStockOnly,
    itemsPerPage,
    currentPage,
    updateCurrentPage,
  ]);

  const totalPages = pagination.totalPages;
  const startIndex = (pagination.page - 1) * pagination.size + 1;
  const endIndex = Math.min(pagination.page * pagination.size, pagination.total);

  // Active categories
  const activeCategories = useMemo(() => {
    return categories.filter(c => c.isActive !== false);
  }, [categories]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000000) count++;
    if (showFeaturedOnly) count++;
    if (showInStockOnly) count++;
    return count;
  }, [selectedCategories, priceRange, showFeaturedOnly, showInStockOnly]);

  const handleCategoryToggle = useCallback(
    (categoryId: number) => {
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      updateSelectedCategories(newCategories);
    },
    [selectedCategories, updateSelectedCategories],
  );

  const handleClearFilters = useCallback(() => {
    // Update all state values
    setSelectedCategories([]);
    setPriceRange([0, 1000000]);
    setShowFeaturedOnly(false);
    setShowInStockOnly(false);
    setSearchQuery('');

    // Update URL in a single call to ensure proper synchronization
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

  const breadcrumbs = [{ label: 'Tất cả sản phẩm' }];

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <FolderOpen className="text-primary h-4 w-4" />
          Danh mục
        </h3>
        <div className="space-y-3">
          {activeCategories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label
                htmlFor={`cat-${category.id}`}
                className="flex flex-1 cursor-pointer items-center justify-between text-sm"
              >
                <span className="line-clamp-1">{category.name}</span>
                {category.isFeatured && (
                  <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Tag className="text-primary h-4 w-4" />
          Khoảng giá
        </h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={value => updatePriceRange(value as [number, number])}
            min={0}
            max={1000000}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{formatCurrency(priceRange[0])}</span>
            <span className="text-muted-foreground">{formatCurrency(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Filters */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="text-primary h-4 w-4" />
          Bộ lọc khác
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured-only"
              checked={showFeaturedOnly}
              onCheckedChange={checked => updateShowFeaturedOnly(checked as boolean)}
            />
            <Label htmlFor="featured-only" className="cursor-pointer text-sm">
              Chỉ sản phẩm nổi bật
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock-only"
              checked={showInStockOnly}
              onCheckedChange={checked => updateShowInStockOnly(checked as boolean)}
            />
            <Label htmlFor="in-stock-only" className="cursor-pointer text-sm">
              Chỉ còn hàng
            </Label>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc ({activeFiltersCount})
          </Button>
        </>
      )}

      {/* Quick Links */}
      <Separator />
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Layers className="text-primary h-4 w-4" />
          Liên kết nhanh
        </h3>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Xem danh mục
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  // Show full skeleton on initial load when no data
  if (loading && products.length === 0 && categories.length === 0) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <div className="border-b bg-white">
        <PageHeader
          title="Tất cả sản phẩm"
          description="Khám phá bộ sưu tập thiệp và quà tặng đa dạng cho mọi dịp đặc biệt"
          breadcrumbs={breadcrumbs}
          variant="hero"
        />

        {/* Stats Bar */}
        <div className="container mx-auto px-4 pb-6">
          <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-sm">
              <Package className="text-primary h-5 w-5" />
              <span>
                <strong>{products.length}</strong> sản phẩm
              </span>
            </div>
            <div className="bg-border h-4 w-px" />
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="text-primary h-5 w-5" />
              <span>
                Đã bán <strong>{pageStats.totalSold}</strong>
              </span>
            </div>
            <div className="bg-border h-4 w-px" />
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span>
                <strong>{pageStats.happyCustomers}</strong> khách hàng hài lòng
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <Card className="sticky top-24">
              <CardContent className="px-4">
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Filters Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative max-w-md flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={e => updateSearchQuery(e.target.value)}
                  className="pr-8 pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
                    onClick={() => updateSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Bộ lọc
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto px-4">
                    <SheetHeader className="px-0">
                      <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                      <SheetDescription>
                        Lọc sản phẩm theo danh mục, giá và các tiêu chí khác
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle & Sort */}
                <ProductFilters
                  viewMode={viewMode}
                  onViewModeChange={updateViewMode}
                  sortBy={sortBy}
                  onSortChange={updateSortBy}
                  totalProducts={pagination.total}
                  showViewToggle
                  showSearch={false}
                  className="hidden sm:flex"
                />
              </div>
            </div>

            {/* Active Filters Tags */}
            {(selectedCategories.length > 0 || showFeaturedOnly || showInStockOnly) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">Đang lọc:</span>
                {selectedCategories.map(catId => {
                  const cat = categories.find(c => c.id === catId);
                  return cat ? (
                    <Badge
                      key={catId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(catId)}
                    >
                      {cat.name}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : null;
                })}
                {showFeaturedOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => updateShowFeaturedOnly(false)}
                  >
                    Nổi bật
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {showInStockOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => updateShowInStockOnly(false)}
                  >
                    Còn hàng
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-6 px-2 text-xs"
                  onClick={handleClearFilters}
                >
                  Xóa tất cả
                </Button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-muted-foreground mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                Hiển thị <strong>{startIndex}</strong> - <strong>{endIndex}</strong> trong tổng số{' '}
                <strong>{pagination.total}</strong> sản phẩm
                {debouncedSearch && ` cho "${debouncedSearch}"`}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-muted-foreground text-xs">
                  Hiển thị:
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={value => {
                    updateItemsPerPage(Number(value));
                  }}
                >
                  <SelectTrigger id="items-per-page" className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              viewMode === 'list' ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductListItemSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    'grid',
                    viewMode === 'compact'
                      ? 'grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4'
                      : 'grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3',
                  )}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductCardSkeleton
                      key={i}
                      variant={viewMode === 'compact' ? 'compact' : 'default'}
                    />
                  ))}
                </div>
              )
            ) : products.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent>
                  <Grid3X3 className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-lg font-semibold">Không tìm thấy sản phẩm</h3>
                  <p className="text-muted-foreground mb-4">
                    {debouncedSearch
                      ? `Không có sản phẩm nào phù hợp với "${debouncedSearch}"`
                      : 'Không có sản phẩm nào phù hợp với bộ lọc hiện tại.'}
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {products.map(product => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    showCategory
                    showAddToWishlist
                    showAddToCart
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  'grid',
                  viewMode === 'compact'
                    ? 'grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4'
                    : 'grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3',
                )}
              >
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode === 'compact' ? 'compact' : 'default'}
                    showCategory
                    showDescription={viewMode !== 'compact'}
                    showAddToWishlist
                    showAddToCart
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        type="button"
                        onClick={() => updateCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                        className={cn(
                          buttonVariants({
                            variant: 'ghost',
                            size: 'default',
                          }),
                          'cursor-pointer gap-1 px-2.5 sm:pl-2.5',
                          (currentPage === 1 || loading) && 'pointer-events-none opacity-50',
                        )}
                        aria-label="Trang trước"
                      >
                        <ChevronLeftIcon />
                        <span className="hidden sm:block">Trước</span>
                      </button>
                    </PaginationItem>

                    {/* Generate page numbers to display */}
                    {(() => {
                      const pages: (number | 'ellipsis')[] = [];

                      // Always show first page
                      pages.push(1);

                      // Calculate range around current page
                      const startPage = Math.max(2, currentPage - 1);
                      const endPage = Math.min(totalPages - 1, currentPage + 1);

                      // Add ellipsis after page 1 if needed
                      if (startPage > 2) {
                        pages.push('ellipsis');
                      }

                      // Add pages around current page
                      for (let i = startPage; i <= endPage; i++) {
                        if (i !== 1 && i !== totalPages) {
                          pages.push(i);
                        }
                      }

                      // Add ellipsis before last page if needed
                      if (endPage < totalPages - 1) {
                        pages.push('ellipsis');
                      }

                      // Always show last page (if more than 1 page)
                      if (totalPages > 1) {
                        pages.push(totalPages);
                      }

                      // Remove duplicates and sort
                      const uniquePages: (number | 'ellipsis')[] = [];
                      let lastNum = 0;
                      for (const page of pages) {
                        if (page === 'ellipsis') {
                          if (uniquePages[uniquePages.length - 1] !== 'ellipsis') {
                            uniquePages.push('ellipsis');
                          }
                        } else {
                          if (page !== lastNum) {
                            uniquePages.push(page);
                            lastNum = page;
                          }
                        }
                      }

                      return uniquePages.map((page, index) => {
                        if (page === 'ellipsis') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => !loading && updateCurrentPage(page)}
                              isActive={currentPage === page}
                              className={cn(
                                'cursor-pointer',
                                loading && 'pointer-events-none opacity-50',
                              )}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      });
                    })()}

                    <PaginationItem>
                      <button
                        type="button"
                        onClick={() => updateCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || loading}
                        className={cn(
                          buttonVariants({
                            variant: 'ghost',
                            size: 'default',
                          }),
                          'cursor-pointer gap-1 px-2.5 sm:pr-2.5',
                          (currentPage === totalPages || loading) &&
                            'pointer-events-none opacity-50',
                        )}
                        aria-label="Trang sau"
                      >
                        <span className="hidden sm:block">Sau</span>
                        <ChevronRightIcon />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>

        {/* Promotional Banner */}
        <div className="mt-12">
          <PromoBanner
            title="🎉 Khuyến mãi đặc biệt!"
            description="Giảm 20% cho đơn hàng đầu tiên. Sử dụng mã WELCOME20 khi thanh toán."
            variant="gradient"
          />
        </div>

        {/* Trust Badges */}
        <div className="mt-8">
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}

// Skeleton component for products page
function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="relative border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="pt-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="py-12 md:py-16 lg:py-20">
            <div className="mb-4">
              <Skeleton className="h-10 w-48 md:h-12 md:w-64" />
            </div>
            <Skeleton className="mb-2 h-5 w-full max-w-2xl" />
            <Skeleton className="h-5 w-3/4 max-w-2xl" />
          </div>

          <div className="pb-6">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-24" />
                  {i < 2 && <Skeleton className="bg-border hidden h-4 w-px sm:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <Card className="sticky top-24">
              <CardContent className="px-4">
                <div className="space-y-6">
                  <div>
                    <Skeleton className="mb-4 h-5 w-32" />
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Skeleton className="mb-4 h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <div className="mt-4 flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Skeleton className="mb-4 h-5 w-28" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-10 max-w-md flex-1" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24 lg:hidden" />
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-1 rounded-lg border p-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} variant="default" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { ProductListItem, ProductListItemSkeleton } from '@/components/product/ProductListItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PromoBanner, TrustBadges } from '@/components/ui/decorative-elements';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
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
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { cn, formatCurrency } from '@/lib/utils';
import { addToCart as addToCartApi } from '@/services/cart.service';
import type { Category, Product } from '@/types';
import {
  ArrowRight,
  Filter,
  FolderOpen,
  Grid3X3,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react';

interface ProductsPageClientProps {
  products: Product[];
  categories: Category[];
  loading?: boolean;
}

// Stats for visual appeal
const pageStats = {
  totalSold: '5,000+',
  happyCustomers: '10,000+',
};

export function ProductsPageClient({
  products,
  categories,
  loading = false,
}: ProductsPageClientProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

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
      } catch (error: any) {
        toast({
          title: 'Lỗi',
          description: error.response?.data?.message || 'Không thể thêm vào giỏ hàng',
          variant: 'destructive',
        });
      }
    },
    [isAuthenticated, toast],
  );

  // Calculate price bounds
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category?.name?.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category?.id));
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Featured filter
    if (showFeaturedOnly) {
      result = result.filter(p => p.isFeatured);
    }

    // In stock filter
    if (showInStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [
    products,
    debouncedSearch,
    selectedCategories,
    priceRange,
    showFeaturedOnly,
    showInStockOnly,
    sortBy,
  ]);

  // Active categories
  const activeCategories = useMemo(() => {
    return categories.filter(c => c.isActive !== false);
  }, [categories]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max) count++;
    if (showFeaturedOnly) count++;
    if (showInStockOnly) count++;
    return count;
  }, [selectedCategories, priceRange, priceBounds, showFeaturedOnly, showInStockOnly]);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId],
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setShowFeaturedOnly(false);
    setShowInStockOnly(false);
    setSearchQuery('');
  }, [priceBounds]);

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
            onValueChange={value => setPriceRange(value as [number, number])}
            min={priceBounds.min}
            max={priceBounds.max}
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
              onCheckedChange={checked => setShowFeaturedOnly(checked as boolean)}
            />
            <Label htmlFor="featured-only" className="cursor-pointer text-sm">
              Chỉ sản phẩm nổi bật
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock-only"
              checked={showInStockOnly}
              onCheckedChange={checked => setShowInStockOnly(checked as boolean)}
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
              <CardContent className="p-4">
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
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-8 pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
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
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
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
                  onViewModeChange={setViewMode}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalProducts={filteredProducts.length}
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
                    onClick={() => setShowFeaturedOnly(false)}
                  >
                    Nổi bật
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {showInStockOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setShowInStockOnly(false)}
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
            <div className="text-muted-foreground mb-4 text-sm">
              Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
              {debouncedSearch && ` cho "${debouncedSearch}"`}
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
            ) : filteredProducts.length === 0 ? (
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
                {filteredProducts.map(product => (
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
                {filteredProducts.map(product => (
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

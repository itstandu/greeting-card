'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { ProductListItem, ProductListItemSkeleton } from '@/components/product/ProductListItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrustBadges } from '@/components/ui/decorative-elements';
import { PageHeader } from '@/components/ui/page-header';
import { ProductFilters, ViewMode } from '@/components/ui/product-filters';
import { SafeImage } from '@/components/ui/safe-image';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { cn, formatCurrency } from '@/lib/utils';
import type { Category, Product } from '@/types';
import {
  ArrowRight,
  FolderOpen,
  Grid3X3,
  Package,
  ShoppingBag,
  Star,
  Tag,
  TrendingUp,
} from 'lucide-react';

interface CategoryDetailClientProps {
  category: Category | null;
  products: Product[];
  allCategories: Category[];
  loading?: boolean;
  error?: boolean;
}

// Stats hardcoded for visual appeal
const categoryStats = {
  totalSold: '1,234+',
  rating: '4.8',
  reviews: '856',
};

export function CategoryDetailClient({
  category,
  products,
  allCategories,
  loading = false,
  error = false,
}: CategoryDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter and sort products - MUST be called before early returns (Rules of Hooks)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query),
      );
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
  }, [products, debouncedSearch, sortBy]);

  // Related categories (same level or featured) - MUST be called before early returns
  const relatedCategories = useMemo(() => {
    if (!category) return [];
    return allCategories.filter(c => c.id !== category.id && c.isActive !== false).slice(0, 6);
  }, [allCategories, category]);

  // Price stats - MUST be called before early returns
  const priceStats = useMemo(() => {
    if (products.length === 0) return null;
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  }, [products]);

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-8 h-16 w-64" />
          <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} variant="default" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-semibold">Không tìm thấy danh mục</h2>
            <p className="text-muted-foreground">Danh mục bạn đang tìm kiếm không tồn tại.</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [{ label: 'Danh mục', href: '/categories' }, { label: category.name }];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header with Background Image */}
      <div className="relative border-b bg-white">
        <PageHeader
          title={category.name}
          description={category.description}
          breadcrumbs={breadcrumbs}
          variant="hero"
          backgroundImage={category.imageUrl}
          badge={
            category.isFeatured && (
              <Badge className="bg-amber-500 hover:bg-amber-600">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Danh mục nổi bật
              </Badge>
            )
          }
        />

        {/* Category Stats Bar */}
        <div className="container mx-auto px-4 pb-6">
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Package className="text-primary h-4 w-4" />
              <span className="font-medium">{products.length} sản phẩm</span>
            </div>
            <div className="bg-border hidden h-4 w-px sm:block" />
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4" />
              <span>Đã bán {categoryStats.totalSold}</span>
            </div>
            <div className="bg-border hidden h-4 w-px sm:block" />
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>
                {categoryStats.rating} ({categoryStats.reviews} đánh giá)
              </span>
            </div>
            {priceStats && (
              <>
                <div className="bg-border hidden h-4 w-px sm:block" />
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>Từ {formatCurrency(priceStats.min)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-6 lg:w-64">
            {/* Related Categories */}
            {relatedCategories.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <FolderOpen className="text-primary h-4 w-4" />
                    Danh mục khác
                  </h3>
                  <div className="space-y-2">
                    {relatedCategories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className={cn(
                          'hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors',
                          cat.slug === category.slug && 'bg-accent font-medium',
                        )}
                      >
                        {cat.imageUrl ? (
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded">
                            <SafeImage
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded">
                            <Tag className="text-primary h-4 w-4" />
                          </div>
                        )}
                        <span className="truncate text-sm">{cat.name}</span>
                        {cat.isFeatured && (
                          <Star className="ml-auto h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                        )}
                      </Link>
                    ))}
                  </div>
                  <Button variant="ghost" className="mt-4 w-full" asChild>
                    <Link href="/categories" className="flex items-center gap-2">
                      Xem tất cả danh mục
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h3 className="text-primary mb-3 font-semibold">💡 Mẹo hay</h3>
                <p className="text-muted-foreground text-sm">
                  Thêm sản phẩm vào wishlist để theo dõi giá và nhận thông báo khi có khuyến mãi!
                </p>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Filters Bar */}
            <div className="mb-6">
              <ProductFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalProducts={filteredProducts.length}
                showViewToggle
                showSearch
              />
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent>
                  <Grid3X3 className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-lg font-semibold">Không tìm thấy sản phẩm</h3>
                  <p className="text-muted-foreground mb-4">
                    {debouncedSearch
                      ? `Không có sản phẩm nào phù hợp với "${debouncedSearch}"`
                      : 'Danh mục này hiện chưa có sản phẩm nào.'}
                  </p>
                  {debouncedSearch && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Xóa tìm kiếm
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    showCategory={false}
                    showAddToWishlist
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
                    showCategory={false}
                    showDescription={viewMode !== 'compact'}
                    showAddToWishlist
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Trust Badges */}
        <div className="mt-12">
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}

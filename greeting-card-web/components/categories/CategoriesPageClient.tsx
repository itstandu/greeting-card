'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryCard } from '@/components/ui/category-card';
import { PromoBanner, TrustBadges } from '@/components/ui/decorative-elements';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { useDebounce } from '@/hooks/use-debounce';
import type { Category } from '@/types';
import { FolderOpen, Layers, Search, Star, X } from 'lucide-react';

interface CategoriesPageClientProps {
  categories: Category[];
}

// Stats for visual appeal
const pageStats = {
  totalProducts: '500+',
  totalCategories: '20+',
  happyCustomers: '10,000+',
};

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch) return categories.filter(c => c.isActive !== false);

    const query = debouncedSearch.toLowerCase();
    return categories.filter(
      c =>
        c.isActive !== false &&
        (c.name.toLowerCase().includes(query) || c.description?.toLowerCase().includes(query)),
    );
  }, [categories, debouncedSearch]);

  const breadcrumbs = [{ label: 'Tất cả danh mục' }];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <div className="border-b bg-white">
        <PageHeader
          title="Khám phá Danh mục"
          description="Tìm kiếm thiệp và quà tặng hoàn hảo cho mọi dịp đặc biệt trong cuộc sống"
          breadcrumbs={breadcrumbs}
          variant="hero"
        />

        {/* Stats Bar */}
        <div className="container mx-auto px-4 pb-6">
          <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="text-primary h-5 w-5" />
              <span>
                <strong>{pageStats.totalCategories}</strong> danh mục
              </span>
            </div>
            <div className="bg-border h-4 w-px" />
            <div className="flex items-center gap-2 text-sm">
              <FolderOpen className="text-primary h-5 w-5" />
              <span>
                <strong>{pageStats.totalProducts}</strong> sản phẩm
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
        {/* Search Bar */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Tìm kiếm danh mục..."
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
        </div>

        {/* All Categories */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="text-primary h-5 w-5" />
              <h2 className="text-2xl font-bold">
                {debouncedSearch ? 'Kết quả tìm kiếm' : 'Tất cả danh mục'}
              </h2>
            </div>
            <span className="text-muted-foreground text-sm">
              {filteredCategories.length} danh mục
            </span>
          </div>

          {filteredCategories.length === 0 ? (
            <Card className="py-16 text-center">
              <CardContent>
                <FolderOpen className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-lg font-semibold">Không tìm thấy danh mục</h3>
                <p className="text-muted-foreground mb-4">
                  {debouncedSearch
                    ? `Không có danh mục nào phù hợp với "${debouncedSearch}"`
                    : 'Hiện chưa có danh mục nào.'}
                </p>
                {debouncedSearch && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Xóa tìm kiếm
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  variant="default"
                  showDescription
                />
              ))}
            </div>
          )}
        </section>

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

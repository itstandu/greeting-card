'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/types';
import { ArrowRight, FolderOpen, Layers, SlidersHorizontal, Star, Tag, X } from 'lucide-react';

interface ProductsFilterSidebarProps {
  categories: Category[];
  selectedCategories: number[];
  priceRange: [number, number];
  showFeaturedOnly: boolean;
  showInStockOnly: boolean;
  activeFiltersCount: number;
  onCategoryToggle: (categoryId: number) => void;
  onPriceRangeChange: (value: [number, number]) => void;
  onFeaturedToggle: (value: boolean) => void;
  onInStockToggle: (value: boolean) => void;
  onClearFilters: () => void;
}

export function ProductsFilterSidebar({
  categories,
  selectedCategories,
  priceRange,
  showFeaturedOnly,
  showInStockOnly,
  activeFiltersCount,
  onCategoryToggle,
  onPriceRangeChange,
  onFeaturedToggle,
  onInStockToggle,
  onClearFilters,
}: ProductsFilterSidebarProps) {
  const activeCategories = categories.filter(c => c.isActive !== false);

  return (
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
                onCheckedChange={() => onCategoryToggle(category.id)}
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
            onValueChange={value => onPriceRangeChange(value as [number, number])}
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
              onCheckedChange={checked => onFeaturedToggle(checked as boolean)}
            />
            <Label htmlFor="featured-only" className="cursor-pointer text-sm">
              Chỉ sản phẩm nổi bật
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock-only"
              checked={showInStockOnly}
              onCheckedChange={checked => onInStockToggle(checked as boolean)}
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
          <Button variant="outline" className="w-full" onClick={onClearFilters}>
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
}

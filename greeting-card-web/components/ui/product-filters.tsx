'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import {
  Filter,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export type SortOption = {
  value: string;
  label: string;
};

export type ViewMode = 'grid' | 'list' | 'compact';

interface ProductFiltersProps {
  categories?: Category[];
  selectedCategory?: string;
  onCategoryChange?: (categorySlug: string | undefined) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
  maxPrice?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  showSearch?: boolean;
  showPriceFilter?: boolean;
  totalProducts?: number;
  className?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'price-asc', label: 'Giá: Thấp đến cao' },
  { value: 'price-desc', label: 'Giá: Cao đến thấp' },
  { value: 'name-asc', label: 'Tên: A-Z' },
  { value: 'name-desc', label: 'Tên: Z-A' },
  { value: 'popular', label: 'Phổ biến nhất' },
];

export function ProductFilters({
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortBy = 'newest',
  onSortChange,
  sortOptions = defaultSortOptions,
  searchQuery = '',
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 1000000,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  showSearch = true,
  showPriceFilter = false,
  totalProducts,
  className,
}: ProductFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    priceRange || [0, maxPrice],
  );

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory ||
      searchQuery ||
      (priceRange && (priceRange[0] > 0 || priceRange[1] < maxPrice))
    );
  }, [selectedCategory, searchQuery, priceRange, maxPrice]);

  const handleResetFilters = () => {
    onCategoryChange?.(undefined);
    onSearchChange?.('');
    onPriceRangeChange?.([0, maxPrice]);
    setLocalPriceRange([0, maxPrice]);
  };

  const handlePriceRangeApply = () => {
    onPriceRangeChange?.(localPriceRange);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          {showSearch && (
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={e => onSearchChange?.(e.target.value)}
                className="pr-8 pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
                  onClick={() => onSearchChange?.('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Mobile Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Category Filter - Mobile */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <Label>Danh mục</Label>
                    <Select
                      value={selectedCategory || 'all'}
                      onValueChange={value =>
                        onCategoryChange?.(value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sort - Mobile */}
                <div className="space-y-3">
                  <Label>Sắp xếp theo</Label>
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range - Mobile */}
                {showPriceFilter && (
                  <div className="space-y-3">
                    <Label>Khoảng giá</Label>
                    <Slider
                      value={localPriceRange}
                      min={0}
                      max={maxPrice}
                      step={10000}
                      onValueChange={value => setLocalPriceRange(value as [number, number])}
                    />
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>{localPriceRange[0].toLocaleString()}đ</span>
                      <span>{localPriceRange[1].toLocaleString()}đ</span>
                    </div>
                    <Button onClick={handlePriceRangeApply} size="sm" className="w-full">
                      Áp dụng
                    </Button>
                  </div>
                )}

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleResetFilters} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Category Filter */}
          {categories.length > 0 && (
            <Select
              value={selectedCategory || 'all'}
              onValueChange={value => onCategoryChange?.(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="hidden w-48 sm:flex">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Right side - Sort, View Toggle, Count */}
        <div className="flex items-center gap-3">
          {/* Product Count */}
          {totalProducts !== undefined && (
            <span className="text-muted-foreground hidden text-sm sm:block">
              {totalProducts} sản phẩm
            </span>
          )}

          {/* Sort Select - Desktop */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="hidden w-44 sm:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          {showViewToggle && (
            <div className="hidden items-center rounded-lg border p-1 sm:flex">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewModeChange?.('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewModeChange?.('compact')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewModeChange?.('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Reset Filters - Desktop */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="hidden sm:flex"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Đang lọc:</span>
          {selectedCategory && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onCategoryChange?.(undefined)}
            >
              {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              <X className="h-3 w-3" />
            </Button>
          )}
          {searchQuery && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onSearchChange?.('')}
            >
              &quot;{searchQuery}&quot;
              <X className="h-3 w-3" />
            </Button>
          )}
          {priceRange && (priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onPriceRangeChange?.([0, maxPrice])}
            >
              {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

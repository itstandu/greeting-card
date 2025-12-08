'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';
import { X } from 'lucide-react';

interface ActiveFiltersTagsProps {
  categories: Category[];
  selectedCategories: number[];
  showFeaturedOnly: boolean;
  showInStockOnly: boolean;
  onCategoryToggle: (categoryId: number) => void;
  onFeaturedToggle: (value: boolean) => void;
  onInStockToggle: (value: boolean) => void;
  onClearAll: () => void;
}

export function ActiveFiltersTags({
  categories,
  selectedCategories,
  showFeaturedOnly,
  showInStockOnly,
  onCategoryToggle,
  onFeaturedToggle,
  onInStockToggle,
  onClearAll,
}: ActiveFiltersTagsProps) {
  const hasActiveFilters = selectedCategories.length > 0 || showFeaturedOnly || showInStockOnly;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">Đang lọc:</span>
      {selectedCategories.map(catId => {
        const cat = categories.find(c => c.id === catId);
        return cat ? (
          <Badge
            key={catId}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => onCategoryToggle(catId)}
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
          onClick={() => onFeaturedToggle(false)}
        >
          Nổi bật
          <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
      {showInStockOnly && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onInStockToggle(false)}
        >
          Còn hàng
          <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-6 px-2 text-xs"
        onClick={onClearAll}
      >
        Xóa tất cả
      </Button>
    </div>
  );
}

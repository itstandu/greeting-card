'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { FilterX, RefreshCw, Search, X } from 'lucide-react';

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  value?: string | number | boolean;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  displayValue: string;
}

export interface AdminTableFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterFields?: FilterField[];
  onFilterChange?: (key: string, value: string) => void;
  onRefresh: () => void;
  onClearFilters?: () => void;
  isLoading?: boolean;
  activeFilters?: ActiveFilter[];
  totalCount?: number;
  actionButton?: ReactNode;
}

export function AdminTableFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filterFields = [],
  onFilterChange,
  onRefresh,
  onClearFilters,
  isLoading = false,
  activeFilters = [],
  totalCount,
  actionButton,
}: AdminTableFilterProps) {
  const hasActiveFilters = activeFilters.length > 0 || searchValue.trim() !== '';

  return (
    <div className="space-y-3">
      {/* Header with total count and action button */}
      {(totalCount !== undefined || actionButton) && (
        <div className="flex items-center justify-between">
          {totalCount !== undefined && (
            <Badge variant="secondary" className="h-8 text-sm">
              Tổng số: {totalCount}
            </Badge>
          )}
          {actionButton && <div className="ml-auto">{actionButton}</div>}
        </div>
      )}

      {/* Search and Filters Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative max-w-sm flex-1">
          <Label htmlFor="admin-search" className="sr-only">
            Tìm kiếm
          </Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="admin-search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="pr-9 pl-9"
              disabled={isLoading}
            />
            {searchValue && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                onClick={() => onSearchChange('')}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
          {searchValue && (
            <p className="text-muted-foreground mt-1 text-xs">
              Tự động tìm kiếm sau 300ms khi bạn ngừng nhập...
            </p>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Filter Fields */}
          {filterFields.map(field => (
            <div key={field.key}>
              {field.type === 'select' && field.options && (
                <Select
                  value={field.value?.toString() || ''}
                  onValueChange={value => onFilterChange?.(field.key, value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={field.placeholder || field.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>

          {/* Clear Filters Button */}
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
              title="Xóa tất cả bộ lọc"
            >
              <FilterX className="size-4" />
              <span className="hidden sm:inline">Xóa bộ lọc</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">Đang lọc:</span>
          {activeFilters.map(filter => (
            <Badge key={filter.key} variant="secondary" className="gap-1.5 pr-1.5 pl-2.5 text-xs">
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.displayValue}</span>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-muted-foreground/20 ml-1 size-4 rounded-full p-0"
                onClick={() => onFilterChange?.(filter.key, '')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

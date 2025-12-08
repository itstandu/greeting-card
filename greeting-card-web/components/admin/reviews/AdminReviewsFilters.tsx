'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReviewFilters } from '@/types';
import { Filter, RefreshCw, Star } from 'lucide-react';

interface AdminReviewsFiltersProps {
  filters: ReviewFilters;
  loading: boolean;
  onFiltersChange: (filters: ReviewFilters) => void;
  onRefresh: () => void;
}

export function AdminReviewsFilters({
  filters,
  loading,
  onFiltersChange,
  onRefresh,
}: AdminReviewsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative min-w-[200px] flex-1">
        <Input
          placeholder="Tìm kiếm theo nội dung, người dùng..."
          value={filters.search || ''}
          onChange={e => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.isApproved === undefined ? 'all' : filters.isApproved.toString()}
        onValueChange={value =>
          onFiltersChange({
            ...filters,
            isApproved: value === 'all' ? undefined : value === 'true',
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="true">Đã duyệt</SelectItem>
          <SelectItem value="false">Chờ duyệt</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.rating?.toString() || 'all'}
        onValueChange={value =>
          onFiltersChange({
            ...filters,
            rating: value === 'all' ? undefined : parseInt(value),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[130px]">
          <Star className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Đánh giá" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          {[5, 4, 3, 2, 1].map(rating => (
            <SelectItem key={rating} value={rating.toString()}>
              {rating} sao
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onRefresh} disabled={loading} className="gap-2">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Làm mới</span>
      </Button>
    </div>
  );
}

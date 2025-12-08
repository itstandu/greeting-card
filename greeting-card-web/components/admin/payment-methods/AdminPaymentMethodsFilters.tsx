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
import type { PaymentMethodFilters } from '@/services/payment-method.service';
import { RefreshCw, Search } from 'lucide-react';

interface AdminPaymentMethodsFiltersProps {
  filters: PaymentMethodFilters;
  loading: boolean;
  onFiltersChange: (filters: PaymentMethodFilters) => void;
  onRefresh: () => void;
}

export function AdminPaymentMethodsFilters({
  filters,
  loading,
  onFiltersChange,
  onRefresh,
}: AdminPaymentMethodsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative min-w-[200px] flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Tìm kiếm theo tên, mã..."
          value={filters.search || ''}
          onChange={e => onFiltersChange({ ...filters, search: e.target.value, page: 1 })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
        onValueChange={value =>
          onFiltersChange({
            ...filters,
            isActive: value === 'all' ? undefined : value === 'true',
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="true">Đang hoạt động</SelectItem>
          <SelectItem value="false">Đã vô hiệu</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onRefresh} disabled={loading} className="gap-2">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Làm mới</span>
      </Button>
    </div>
  );
}

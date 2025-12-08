'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminReviewsPaginationProps {
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function AdminReviewsPagination({
  pagination,
  loading,
  onPageChange,
}: AdminReviewsPaginationProps) {
  const start = (pagination.page - 1) * pagination.size + 1;
  const end = Math.min(pagination.page * pagination.size, pagination.total);
  const paginationSummary =
    pagination.total > 0 ? `${start} - ${end} / ${pagination.total}` : 'Không có dữ liệu';

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">Hiển thị {paginationSummary}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1 || loading}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Trước
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm">Trang</span>
          <Input
            type="number"
            min={1}
            max={Math.max(1, pagination.totalPages)}
            value={pagination.page}
            onChange={e => {
              const value = parseInt(e.target.value, 10);
              const maxPages = Math.max(1, pagination.totalPages);
              if (!isNaN(value) && value >= 1 && value <= maxPages) {
                onPageChange(value);
              }
            }}
            onBlur={e => {
              const value = parseInt(e.target.value, 10);
              const maxPages = Math.max(1, pagination.totalPages);
              if (isNaN(value) || value < 1) {
                onPageChange(1);
              } else if (value > maxPages) {
                onPageChange(maxPages);
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="h-8 w-16 text-center"
            disabled={loading}
          />
          <span className="text-sm">/ {Math.max(1, pagination.totalPages)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages || loading}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

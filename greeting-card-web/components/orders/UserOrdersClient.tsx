'use client';

import { useEffect, useState } from 'react';
import { OrderCard } from './OrderCard';
import { OrderDetailSheet } from './OrderDetailSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrdersPage } from '@/hooks/use-orders-page';
import { Package } from 'lucide-react';

export function UserOrdersClient() {
  const { orders, loading, pagination, fetchOrders } = useOrdersPage();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    fetchOrders({ page: currentPage, size: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
    setSheetOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && pagination && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && pagination && page <= pagination.totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Đơn hàng của tôi</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Đơn hàng của tôi</h1>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <Package className="text-muted-foreground h-16 w-16" />
          <h2 className="text-2xl font-semibold">Chưa có đơn hàng</h2>
          <p className="text-muted-foreground max-w-md text-center">
            Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!
          </p>
        </div>
      </div>
    );
  }

  const start = pagination ? (pagination.page - 1) * pagination.size + 1 : 0;
  const end = pagination ? Math.min(pagination.page * pagination.size, pagination.total) : 0;
  const paginationSummary =
    pagination && pagination.total > 0 ? `${start} - ${end} / ${pagination.total}` : '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onViewDetail={handleViewOrder} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {paginationSummary && `Hiển thị ${paginationSummary}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Trang</span>
              <Input
                type="number"
                min={1}
                max={Math.max(1, pagination.totalPages)}
                value={pageInput}
                onChange={e => handlePageInputChange(e.target.value)}
                onBlur={handlePageInputBlur}
                onKeyDown={handlePageInputKeyDown}
                className="h-8 w-16 text-center"
                disabled={loading}
              />
              <span className="text-sm">/ {Math.max(1, pagination.totalPages)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pagination.totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Sheet */}
      <OrderDetailSheet
        orderId={selectedOrderId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onOrderUpdate={() => {
          fetchOrders({ page: currentPage, size: 10 });
        }}
      />
    </div>
  );
}

import { useCallback, useState } from 'react';
import { getUserOrders } from '@/services/order.service';
import type { OrderSimple, PaginationParams, PaginationResponse } from '@/types';
import { toast } from 'sonner';

interface UseOrdersPageReturn {
  orders: OrderSimple[];
  loading: boolean;
  pagination: PaginationResponse | null;
  fetchOrders: (params?: PaginationParams) => Promise<void>;
}

export function useOrdersPage(): UseOrdersPageReturn {
  const [orders, setOrders] = useState<OrderSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  const fetchOrders = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true);
      const response = await getUserOrders(params);
      setOrders(response.data || []);
      setPagination(response.pagination || null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error('Không thể tải danh sách đơn hàng', {
        description: message,
      });
      setOrders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    pagination,
    fetchOrders,
  };
}

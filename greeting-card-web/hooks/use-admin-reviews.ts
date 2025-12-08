import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import {
  approveReview,
  deleteAdminReview,
  getAdminReviews,
  rejectReview,
} from '@/services/review.service';
import type { ProductReview, ReviewFilters } from '@/types';

interface UseAdminReviewsReturn {
  reviews: ProductReview[];
  loading: boolean;
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  filters: ReviewFilters;
  setFilters: (filters: ReviewFilters) => void;
  handleApprove: (reviewId: number) => Promise<void>;
  handleReject: (reviewId: number, reason: string) => Promise<void>;
  handleDelete: (reviewId: number) => Promise<void>;
  refresh: () => void;
}

export function useAdminReviews(): UseAdminReviewsReturn {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ReviewFilters>({
    search: '',
    isApproved: undefined,
    rating: undefined,
    page: 1,
    size: 10,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const response = await getAdminReviews(filters);
        setReviews(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách đánh giá',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshKey]);

  const handleApprove = async (reviewId: number) => {
    try {
      await approveReview(reviewId);
      toast({ title: 'Thành công', description: 'Đã duyệt đánh giá' });
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt đánh giá',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (reviewId: number, reason: string) => {
    try {
      await rejectReview(reviewId, { reason });
      toast({ title: 'Thành công', description: 'Đã từ chối đánh giá' });
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối đánh giá',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (reviewId: number) => {
    try {
      await deleteAdminReview(reviewId);
      toast({ title: 'Thành công', description: 'Đã xóa đánh giá' });
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đánh giá',
        variant: 'destructive',
      });
    }
  };

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    reviews,
    loading,
    pagination,
    filters,
    setFilters,
    handleApprove,
    handleReject,
    handleDelete,
    refresh,
  };
}

import { useEffect, useState } from 'react';
import {
  canUserReviewProduct,
  createProductReview,
  getProductReviews,
  getProductReviewStats,
} from '@/services/review.service';
import type { ProductReview, ProductReviewStats } from '@/types';

interface UseProductReviewsOptions {
  productId: number | undefined;
  isAuthenticated: boolean;
}

interface UseProductReviewsReturn {
  reviews: ProductReview[];
  reviewStats: ProductReviewStats | null;
  canReview: boolean;
  loadingReviews: boolean;
  loadingCanReview: boolean;
  submitReview: (rating: number, comment: string) => Promise<void>;
  refreshReviews: () => Promise<void>;
}

export function useProductReviews({
  productId,
  isAuthenticated,
}: UseProductReviewsOptions): UseProductReviewsReturn {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingCanReview, setLoadingCanReview] = useState(true);

  const fetchReviewData = async () => {
    if (!productId) return;

    try {
      setLoadingReviews(true);
      const [reviewsRes, statsRes] = await Promise.all([
        getProductReviews(productId),
        getProductReviewStats(productId),
      ]);
      setReviews(reviewsRes.data || []);
      setReviewStats(statsRes.data || null);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkCanReview = async () => {
    if (!productId || !isAuthenticated) {
      setCanReview(false);
      setLoadingCanReview(false);
      return;
    }

    try {
      setLoadingCanReview(true);
      const response = await canUserReviewProduct(productId);
      setCanReview(response.data || false);
    } catch {
      setCanReview(false);
    } finally {
      setLoadingCanReview(false);
    }
  };

  // Fetch reviews and stats
  useEffect(() => {
    fetchReviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Check if user can review
  useEffect(() => {
    checkCanReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAuthenticated]);

  const submitReview = async (rating: number, comment: string) => {
    if (!productId) return;

    await createProductReview(productId, { rating, comment });
    await fetchReviewData();
    await checkCanReview();
  };

  const refreshReviews = async () => {
    await fetchReviewData();
  };

  return {
    reviews,
    reviewStats,
    canReview,
    loadingReviews,
    loadingCanReview,
    submitReview,
    refreshReviews,
  };
}

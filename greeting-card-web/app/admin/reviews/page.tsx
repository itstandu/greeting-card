'use client';

import { useState } from 'react';
import {
  AdminReviewsFilters,
  AdminReviewsPagination,
  AdminReviewsTable,
  ReviewDeleteDialog,
  ReviewDetailDialog,
  ReviewRejectDialog,
} from '@/components/admin/reviews';
import { useAdminReviews } from '@/hooks/use-admin-reviews';
import type { ProductReview } from '@/types';

export default function AdminReviewsPage() {
  const {
    reviews,
    loading,
    pagination,
    filters,
    setFilters,
    handleApprove,
    handleReject,
    handleDelete,
    refresh,
  } = useAdminReviews();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectClick = (review: ProductReview) => {
    setSelectedReview(review);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedReview || !rejectReason.trim()) return;
    await handleReject(selectedReview.id, rejectReason);
    setRejectDialogOpen(false);
    setRejectReason('');
    setSelectedReview(null);
  };

  const handleDeleteClick = (review: ProductReview) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    await handleDelete(selectedReview.id);
    setDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  const handleViewDetail = (review: ProductReview) => {
    setSelectedReview(review);
    setDetailDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
      </div>

      <AdminReviewsFilters
        filters={filters}
        loading={loading}
        onFiltersChange={setFilters}
        onRefresh={refresh}
      />

      <AdminReviewsTable
        reviews={reviews}
        loading={loading}
        onViewDetail={handleViewDetail}
        onApprove={handleApprove}
        onReject={handleRejectClick}
        onDelete={handleDeleteClick}
      />

      <AdminReviewsPagination
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
      />

      <ReviewDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        review={selectedReview}
      />

      <ReviewRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onConfirm={handleRejectConfirm}
      />

      <ReviewDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

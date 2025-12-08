'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProductReview } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, Eye, Star, Trash2, X } from 'lucide-react';

interface AdminReviewsTableProps {
  reviews: ProductReview[];
  loading: boolean;
  onViewDetail: (review: ProductReview) => void;
  onApprove: (reviewId: number) => void;
  onReject: (review: ProductReview) => void;
  onDelete: (review: ProductReview) => void;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function AdminReviewsTable({
  reviews,
  loading,
  onViewDetail,
  onApprove,
  onReject,
  onDelete,
}: AdminReviewsTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center">
                Không có đánh giá nào
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map(review => (
            <TableRow key={review.id}>
              <TableCell>{review.id}</TableCell>
              <TableCell>
                <div className="max-w-[150px] truncate" title={review.product.name}>
                  {review.product.name}
                </div>
              </TableCell>
              <TableCell>{review.user.fullName}</TableCell>
              <TableCell>{renderStars(review.rating)}</TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={review.comment}>
                  {review.comment || '(Không có nội dung)'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {review.isApproved ? (
                    <Badge variant="default" className="bg-green-500">
                      Đã duyệt
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Chờ duyệt</Badge>
                  )}
                  {review.isVerifiedPurchase && (
                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                      Đã mua
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetail(review)}
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!review.isApproved && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onApprove(review.id)}
                      className="text-green-600 hover:text-green-700"
                      title="Duyệt"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {!review.isApproved && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReject(review)}
                      className="text-orange-600 hover:text-orange-700"
                      title="Từ chối"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(review)}
                    className="text-red-600 hover:text-red-700"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

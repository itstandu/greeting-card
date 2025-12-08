'use client';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProductReview } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Star } from 'lucide-react';

interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ProductReview | null;
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

export function ReviewDetailDialog({ open, onOpenChange, review }: ReviewDetailDialogProps) {
  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết đánh giá</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sản phẩm</label>
            <p className="text-muted-foreground text-sm">{review.product.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Người đánh giá</label>
            <p className="text-muted-foreground text-sm">{review.user.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Đánh giá</label>
            <div className="mt-1">{renderStars(review.rating)}</div>
          </div>
          <div>
            <label className="text-sm font-medium">Nội dung</label>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {review.comment || '(Không có nội dung)'}
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <p className="text-sm">
                {review.isApproved ? (
                  <Badge className="bg-green-500">Đã duyệt</Badge>
                ) : (
                  <Badge variant="secondary">Chờ duyệt</Badge>
                )}
              </p>
            </div>
            {review.isVerifiedPurchase && (
              <div>
                <label className="text-sm font-medium">Xác thực</label>
                <p className="text-sm">
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    Đã mua hàng
                  </Badge>
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Ngày tạo</label>
            <p className="text-muted-foreground text-sm">
              {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                locale: vi,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

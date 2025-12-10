'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProductReview, ProductReviewStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircle2, Star, StarHalf } from 'lucide-react';

interface ProductReviewsProps {
  productId: number;
  reviews: ProductReview[];
  stats?: ProductReviewStats;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
  canReview?: boolean;
  isAuthenticated?: boolean;
  loadingCanReview?: boolean;
}

export function ProductReviews({
  reviews,
  stats,
  onSubmitReview,
  canReview = false,
  isAuthenticated = false,
  loadingCanReview = false,
}: ProductReviewsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitReview || rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmitReview(rating, comment);
      setRating(0);
      setComment('');
      toast({
        title: 'Thành công',
        description: 'Đánh giá của bạn đã được gửi và đang chờ phê duyệt',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi đánh giá',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="space-y-8">
      {/* Review Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1">{renderStars(stats.averageRating)}</div>
                <div className="text-muted-foreground text-sm">{stats.totalReviews} đánh giá</div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.ratingDistribution[star] || 0;
                  const percentage =
                    stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <div className="flex w-12 items-center gap-1">
                        <span className="text-sm font-medium">{star}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-muted-foreground w-12 text-right text-sm">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review */}
      {isAuthenticated && (
        <>
          {loadingCanReview ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="text-muted-foreground border-t-primary mb-3 h-8 w-8 animate-spin rounded-full border-4 border-r-transparent border-b-transparent border-l-transparent" />
                <p className="text-muted-foreground text-center text-sm">
                  Đang kiểm tra quyền đánh giá...
                </p>
              </CardContent>
            </Card>
          ) : canReview ? (
            <Card>
              <CardHeader>
                <CardTitle>Viết đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Đánh giá của bạn <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              'h-8 w-8 transition-colors',
                              star <= displayRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground',
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                      Nhận xét
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    loading={isSubmitting}
                  >
                    Gửi đánh giá
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Đánh giá từ khách hàng</h3>
          <div className="space-y-4">
            {reviews.map(review => {
              const userName = review.user?.fullName || 'Người dùng';
              const initials = userName.charAt(0).toUpperCase();

              return (
                <Card key={review.id}>
                  <CardContent>
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        {/* Backend currently only returns user full name, so we use initials as avatar */}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{userName}</span>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã mua hàng
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                          <span className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="text-muted-foreground/30 mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-center">
              Chưa có đánh giá nào cho sản phẩm này
            </p>
            <p className="text-muted-foreground/70 mt-1 text-center text-sm">
              Hãy là người đầu tiên đánh giá sản phẩm!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />);
  }

  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="h-4 w-4 fill-amber-400 text-amber-400" />);
  }

  const remainingStars = 5 - stars.length;
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="text-muted-foreground h-4 w-4" />);
  }

  return stars;
}

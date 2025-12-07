'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  approveReview,
  deleteAdminReview,
  getAdminReviews,
  rejectReview,
} from '@/services/review.service';
import type { ProductReview, ReviewFilters } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, Eye, Filter, RefreshCw, Search, Star, Trash2, X } from 'lucide-react';

export default function AdminReviewsPage() {
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

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const paginationSummary = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total);
    return pagination.total > 0 ? `${start} - ${end} / ${pagination.total}` : 'Không có dữ liệu';
  }, [pagination]);

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

  const handleReject = async () => {
    if (!selectedReview || !rejectReason.trim()) return;

    try {
      await rejectReview(selectedReview.id, { reason: rejectReason });
      toast({ title: 'Thành công', description: 'Đã từ chối đánh giá' });
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedReview(null);
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối đánh giá',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      await deleteAdminReview(selectedReview.id);
      toast({ title: 'Thành công', description: 'Đã xóa đánh giá' });
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đánh giá',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo nội dung, người dùng..."
            value={filters.search || ''}
            onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.isApproved === undefined ? 'all' : filters.isApproved.toString()}
          onValueChange={value =>
            setFilters({
              ...filters,
              isApproved: value === 'all' ? undefined : value === 'true',
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đã duyệt</SelectItem>
            <SelectItem value="false">Chờ duyệt</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.rating?.toString() || 'all'}
          onValueChange={value =>
            setFilters({
              ...filters,
              rating: value === 'all' ? undefined : parseInt(value),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <Star className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[5, 4, 3, 2, 1].map(rating => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} sao
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setRefreshKey(prev => prev + 1)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {/* Table */}
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
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
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
              ))
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  Không có đánh giá nào
                </TableCell>
              </TableRow>
            ) : (
              reviews.map(review => (
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
                        onClick={() => {
                          setSelectedReview(review);
                          setDetailDialogOpen(true);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!review.isApproved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(review.id)}
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
                          onClick={() => {
                            setSelectedReview(review);
                            setRejectDialogOpen(true);
                          }}
                          className="text-orange-600 hover:text-orange-700"
                          title="Từ chối"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Hiển thị {paginationSummary}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
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
                  setFilters({ ...filters, page: value });
                }
              }}
              onBlur={e => {
                const value = parseInt(e.target.value, 10);
                const maxPages = Math.max(1, pagination.totalPages);
                if (isNaN(value) || value < 1) {
                  setFilters({ ...filters, page: 1 });
                } else if (value > maxPages) {
                  setFilters({ ...filters, page: maxPages });
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
            onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Sản phẩm</label>
                <p className="text-muted-foreground text-sm">{selectedReview.product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Người đánh giá</label>
                <p className="text-muted-foreground text-sm">{selectedReview.user.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Đánh giá</label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Nội dung</label>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {selectedReview.comment || '(Không có nội dung)'}
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <p className="text-sm">
                    {selectedReview.isApproved ? (
                      <Badge className="bg-green-500">Đã duyệt</Badge>
                    ) : (
                      <Badge variant="secondary">Chờ duyệt</Badge>
                    )}
                  </p>
                </div>
                {selectedReview.isVerifiedPurchase && (
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
                  {format(new Date(selectedReview.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                    locale: vi,
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đánh giá</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do từ chối đánh giá này.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleReject} disabled={!rejectReason.trim()}>
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

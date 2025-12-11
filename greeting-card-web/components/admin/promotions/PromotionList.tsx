'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PromotionSheet } from '@/components/admin/promotions';
import { AdminTableFilter } from '@/components/admin/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import {
  DISCOUNT_TYPE,
  getPromotionScopeLabel,
  getPromotionTypeLabel,
  PROMOTION_TYPE,
} from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getAllPromotions } from '@/services';
import { Promotion } from '@/types';
import { Edit, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function PromotionList() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const pageSize = 10;

  const paginationSummary = useMemo(() => {
    const start = totalPromotions > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, totalPromotions);
    return totalPromotions > 0 ? `${start} - ${end} / ${totalPromotions}` : 'Không có dữ liệu';
  }, [currentPage, totalPromotions, pageSize]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllPromotions({
        page: currentPage - 1,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });

      // Filter by search keyword if provided
      let filteredPromotions = response.data;
      if (debouncedSearch) {
        filteredPromotions = response.data.filter(
          p =>
            p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.description?.toLowerCase().includes(debouncedSearch.toLowerCase()),
        );
      }

      setPromotions(filteredPromotions);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalPromotions(response.pagination?.total || 0);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải danh sách khuyến mãi',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleClearFilters = () => {
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchPromotions();
  };

  const getPromotionLabel = (promotion: Promotion) => {
    if (promotion.type === PROMOTION_TYPE.DISCOUNT) {
      if (promotion.discountType === DISCOUNT_TYPE.PERCENTAGE) {
        return `${promotion.discountValue}%`;
      }
      return formatCurrency(promotion.discountValue || 0);
    } else if (promotion.type === PROMOTION_TYPE.BOGO) {
      return 'Mua 1 tặng 1';
    } else if (promotion.type === PROMOTION_TYPE.BUY_X_GET_Y) {
      return `Mua ${promotion.buyQuantity} tặng ${promotion.getQuantity}`;
    } else if (promotion.type === PROMOTION_TYPE.BUY_X_PAY_Y) {
      return `Mua ${promotion.buyQuantity} tính tiền ${promotion.payQuantity}`;
    }
    return '-';
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);

    if (!promotion.isActive) {
      return <Badge variant="secondary">Đã tắt</Badge>;
    }
    if (now < validFrom) {
      return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }
    if (now > validUntil) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return <Badge variant="destructive">Hết lượt</Badge>;
    }
    return <Badge className="bg-green-500">Đang hoạt động</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Quản lý khuyến mãi</CardTitle>
          <CardDescription>
            Xem và quản lý tất cả khuyến mãi (BOGO, mua X tặng Y, mua X tính tiền Y) trong hệ thống
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AdminTableFilter
          searchValue={searchKeyword}
          onSearchChange={value => {
            setSearchKeyword(value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm kiếm theo tên khuyến mãi..."
          onRefresh={handleRefresh}
          onClearFilters={handleClearFilters}
          isLoading={loading}
          totalCount={totalPromotions}
          actionButton={
            <Button
              onClick={() => {
                setSelectedPromotion(null);
                setSheetOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo khuyến mãi
            </Button>
          }
        />

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-md border">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">Tên</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Loại</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Phạm vi</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Giá trị</TableHead>
                <TableHead className="w-[220px] min-w-[200px] whitespace-nowrap">
                  Thời gian
                </TableHead>
                <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">Sử dụng</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Sparkles className="text-muted-foreground mb-4 size-12" />
                      <p className="text-muted-foreground">
                        Không có khuyến mãi nào khớp với tiêu chí lọc
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map(promotion => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">{promotion.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPromotionTypeLabel(promotion.type)}</Badge>
                    </TableCell>
                    <TableCell>{getPromotionScopeLabel(promotion.scope)}</TableCell>
                    <TableCell>{getPromotionLabel(promotion)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(promotion.validFrom)}</div>
                        <div className="text-muted-foreground">
                          đến {formatDate(promotion.validUntil)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promotion.usedCount}/{promotion.usageLimit || '∞'}
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPromotion(promotion);
                          setSheetOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground text-sm">Hiển thị {paginationSummary}</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            Trước
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">Trang</span>
            <Input
              type="number"
              min={1}
              max={Math.max(1, totalPages)}
              value={currentPage}
              onChange={e => {
                const value = parseInt(e.target.value, 10);
                const maxPages = Math.max(1, totalPages);
                if (!isNaN(value) && value >= 1 && value <= maxPages) {
                  setCurrentPage(value);
                }
              }}
              onBlur={e => {
                const value = parseInt(e.target.value, 10);
                const maxPages = Math.max(1, totalPages);
                if (isNaN(value) || value < 1) {
                  setCurrentPage(1);
                } else if (value > maxPages) {
                  setCurrentPage(maxPages);
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
            <span className="text-sm">/ {Math.max(1, totalPages)}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages || loading}
          >
            Sau
          </Button>
        </div>
      </CardFooter>

      <PromotionSheet
        open={sheetOpen}
        promotion={selectedPromotion}
        onOpenChange={setSheetOpen}
        onSaved={fetchPromotions}
      />
    </Card>
  );
}

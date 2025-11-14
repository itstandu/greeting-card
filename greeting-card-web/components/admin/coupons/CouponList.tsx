'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CouponSheet } from '@/components/admin/coupons';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { DISCOUNT_TYPE } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getAllCoupons, getCouponByCode } from '@/services';
import { Coupon } from '@/types';
import { Edit, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const pageSize = 10;

  const paginationSummary = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCoupons);
    return totalCoupons > 0 ? `${start} - ${end} / ${totalCoupons}` : 'Không có dữ liệu';
  }, [currentPage, totalCoupons, pageSize]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);

      if (debouncedSearch) {
        try {
          const response = await getCouponByCode(debouncedSearch.trim());
          setCoupons(response.data ? [response.data] : []);
          setTotalPages(1);
          setTotalCoupons(response.data ? 1 : 0);
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string }; status?: number } };
          if (err.response?.status === 404) {
            setCoupons([]);
            setTotalPages(1);
            setTotalCoupons(0);
          } else {
            throw error;
          }
        }
        return;
      }

      const response = await getAllCoupons({
        page: currentPage - 1,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });

      setCoupons(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalCoupons(response.pagination?.total || 0);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải danh sách coupon',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleClearFilters = () => {
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchCoupons();
  };

  const getDiscountLabel = (coupon: Coupon) => {
    if (coupon.discountType === DISCOUNT_TYPE.PERCENTAGE) {
      return `${coupon.discountValue}%`;
    }
    return formatCurrency(coupon.discountValue);
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return <Badge variant="secondary">Đã tắt</Badge>;
    }
    if (now < validFrom) {
      return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }
    if (now > validUntil) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <Badge variant="destructive">Hết lượt</Badge>;
    }
    return <Badge className="bg-green-500">Đang hoạt động</Badge>;
  };

  return (
    <Card className="py-6">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Quản lý giảm giá</CardTitle>
          <CardDescription>Xem và quản lý tất cả mã giảm giá trong hệ thống</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AdminTableFilter
          searchValue={searchKeyword}
          onSearchChange={value => {
            setSearchKeyword(value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm kiếm theo mã coupon..."
          onRefresh={handleRefresh}
          onClearFilters={handleClearFilters}
          isLoading={loading}
          totalCount={totalCoupons}
          actionButton={
            <Button
              onClick={() => {
                setSelectedCoupon(null);
                setSheetOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo Coupon
            </Button>
          }
        />

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-md border">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Mã</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Giảm giá
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Đơn tối thiểu
                </TableHead>
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
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Tag className="text-muted-foreground mb-4 size-12" />
                      <p className="text-muted-foreground">Không có coupon nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map(coupon => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{getDiscountLabel(coupon)}</TableCell>
                    <TableCell>
                      {coupon.minPurchase ? formatCurrency(coupon.minPurchase) : 'Không'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(coupon.validFrom)}</div>
                        <div className="text-muted-foreground">
                          đến {formatDate(coupon.validUntil)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCoupon(coupon);
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
      {totalPages > 1 && (
        <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground text-sm">Hiển thị {paginationSummary}</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Trang</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={e => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1 && value <= totalPages) {
                    setCurrentPage(value);
                  }
                }}
                onBlur={e => {
                  const value = parseInt(e.target.value, 10);
                  if (isNaN(value) || value < 1) {
                    setCurrentPage(1);
                  } else if (value > totalPages) {
                    setCurrentPage(totalPages);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="h-8 w-16 text-center"
              />
              <span className="text-sm">/ {totalPages}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
            >
              Sau
            </Button>
          </div>
        </CardFooter>
      )}

      <CouponSheet
        open={sheetOpen}
        coupon={selectedCoupon}
        onOpenChange={setSheetOpen}
        onSaved={fetchCoupons}
      />
    </Card>
  );
}

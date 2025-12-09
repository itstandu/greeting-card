'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTableFilter } from '@/components/admin/shared';
import { WishlistSheet } from '@/components/admin/wishlists/WishlistSheet';
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
import { formatDate } from '@/lib/utils';
import { getAllWishlists, searchWishlists } from '@/services';
import { WishlistSummary } from '@/types';
import { Eye, Heart } from 'lucide-react';
import { toast } from 'sonner';

export function WishlistsTable() {
  const [wishlists, setWishlists] = useState<WishlistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWishlists, setTotalWishlists] = useState(0);
  const [selectedWishlistId, setSelectedWishlistId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pageSize = 10;

  const paginationSummary = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalWishlists);
    return totalWishlists > 0 ? `${start} - ${end} / ${totalWishlists}` : 'Không có dữ liệu';
  }, [currentPage, totalWishlists, pageSize]);

  const fetchWishlists = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (debouncedSearch) {
        response = await searchWishlists(debouncedSearch, {
          page: currentPage,
          size: 10,
        });
      } else {
        response = await getAllWishlists({
          page: currentPage,
          size: 10,
        });
      }

      setWishlists(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalWishlists(response.pagination?.total || 0);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải danh sách wishlist',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  const handleClearFilters = () => {
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    // Trigger refresh by calling fetchWishlists directly
    fetchWishlists();
  };

  const handleViewWishlist = (wishlistId: number, userId: number) => {
    setSelectedWishlistId(wishlistId);
    setSelectedUserId(userId);
    setIsSheetOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Quản lý danh sách yêu thích</CardTitle>
            <CardDescription>
              Xem và quản lý danh sách yêu thích của tất cả users đã đăng nhập
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
            searchPlaceholder="Tìm theo email hoặc tên khách hàng..."
            onRefresh={handleRefresh}
            onClearFilters={handleClearFilters}
            isLoading={loading}
            totalCount={totalWishlists}
          />

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-lg border">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                    User ID
                  </TableHead>
                  <TableHead className="w-[230px] max-w-[250px] min-w-[180px]">Email</TableHead>
                  <TableHead className="w-[180px] max-w-[200px] min-w-[150px]">
                    Tên khách hàng
                  </TableHead>
                  <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                    Số sản phẩm
                  </TableHead>
                  <TableHead className="w-40 min-w-[150px] whitespace-nowrap">
                    Cập nhật lúc
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : wishlists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Heart className="text-muted-foreground mb-4 size-12" />
                        <p className="text-muted-foreground">Không có wishlist nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  wishlists.map(wishlist => (
                    <TableRow key={wishlist.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        #{wishlist.userId}
                      </TableCell>
                      <TableCell className="truncate" title={wishlist.userEmail}>
                        {wishlist.userEmail}
                      </TableCell>
                      <TableCell className="truncate" title={wishlist.userFullName}>
                        {wishlist.userFullName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{wishlist.totalItems}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(wishlist.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewWishlist(wishlist.id, wishlist.userId)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-4" />
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
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
            >
              Sau
            </Button>
          </div>
        </CardFooter>
      </Card>

      <WishlistSheet
        open={isSheetOpen}
        wishlistId={selectedWishlistId}
        userId={selectedUserId}
        onOpenChange={open => {
          setIsSheetOpen(open);
          if (!open) {
            setSelectedWishlistId(null);
            setSelectedUserId(undefined);
          }
        }}
        onSaved={() => {
          fetchWishlists();
        }}
      />
    </>
  );
}

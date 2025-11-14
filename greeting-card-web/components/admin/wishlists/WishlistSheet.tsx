'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { clearUserWishlist, getWishlistById } from '@/services';
import { WishlistResponse } from '@/types';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type WishlistSheetProps = {
  open: boolean;
  wishlistId: number | null;
  userId?: number;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function WishlistSheet({
  open,
  wishlistId,
  userId,
  onOpenChange,
  onSaved,
}: WishlistSheetProps) {
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const fetchWishlistDetail = useCallback(async () => {
    if (!wishlistId || isNaN(wishlistId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getWishlistById(wishlistId);
      setWishlist(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải thông tin wishlist',
      });
    } finally {
      setLoading(false);
    }
  }, [wishlistId]);

  useEffect(() => {
    if (open && wishlistId) {
      fetchWishlistDetail();
    } else {
      setWishlist(null);
    }
  }, [open, wishlistId, fetchWishlistDetail]);

  const handleClearWishlist = async () => {
    if (!wishlist || !userId) {
      toast.error('Không thể xóa wishlist', {
        description: 'Thiếu thông tin userId',
      });
      setShowClearDialog(false);
      return;
    }

    try {
      await clearUserWishlist(userId);
      toast.success('Đã xóa wishlist');
      setShowClearDialog(false);
      onSaved?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể xóa wishlist',
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-4xl">
          <SheetHeader className="shrink-0">
            <SheetTitle>
              Chi tiết danh sách yêu thích {wishlist ? `#${wishlist.id}` : ''}
            </SheetTitle>
            <SheetDescription>Xem chi tiết các sản phẩm trong danh sách yêu thích</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
            {loading ? (
              <div className="py-8 text-center">Đang tải...</div>
            ) : !wishlist ? (
              <div className="py-8 text-center">Không tìm thấy wishlist</div>
            ) : (
              <div className="space-y-6 py-4">
                {wishlist.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="text-muted-foreground mb-4 size-12" />
                    <p className="text-muted-foreground">Danh sách yêu thích trống</p>
                  </div>
                ) : (
                  <>
                    <div className="w-full overflow-x-auto">
                      <Table className="w-full table-auto">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[280px] max-w-[350px] min-w-[200px]">
                              Sản phẩm
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[100px] whitespace-nowrap">
                              Giá
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[100px] whitespace-nowrap">
                              Tồn kho
                            </TableHead>
                            <TableHead className="w-[150px] min-w-[130px] whitespace-nowrap">
                              Thêm vào lúc
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wishlist.items.map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="w-[280px] max-w-[350px] min-w-[200px]">
                                <div className="flex items-center gap-3">
                                  {item.product.imageUrl && (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      className="size-12 shrink-0 rounded object-cover"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium" title={item.product.name}>
                                      {item.product.name}
                                    </p>
                                    {item.product.description && (
                                      <p
                                        className="text-muted-foreground line-clamp-1 truncate text-sm"
                                        title={item.product.description}
                                      >
                                        {item.product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatCurrency(item.product.price)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <span
                                  className={
                                    item.product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                  }
                                >
                                  {item.product.stock > 0
                                    ? `Còn ${item.product.stock}`
                                    : 'Hết hàng'}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(item.addedAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng số sản phẩm:</span>
                          <span>{wishlist.totalItems}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {wishlist && wishlist.items.length > 0 && userId && (
            <SheetFooter className="bg-background shrink-0 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
                <Trash2 className="mr-2 size-4" />
                Xóa wishlist
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa toàn bộ danh sách yêu thích này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearWishlist}>Xóa wishlist</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

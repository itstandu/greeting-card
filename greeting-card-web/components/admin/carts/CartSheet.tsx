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
import { formatCurrency } from '@/lib/utils';
import { clearUserCart, getCartById } from '@/services';
import { CartResponse } from '@/types';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type CartSheetProps = {
  open: boolean;
  cartId: number | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function CartSheet({ open, cartId, onOpenChange, onSaved }: CartSheetProps) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const fetchCartDetail = useCallback(async () => {
    if (!cartId || isNaN(cartId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getCartById(cartId);
      setCart(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải thông tin giỏ hàng',
      });
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    if (open && cartId) {
      fetchCartDetail();
    } else {
      setCart(null);
    }
  }, [open, cartId, fetchCartDetail]);

  const handleClearCart = async () => {
    if (!cart) return;

    try {
      await clearUserCart(cart.id);
      toast.success('Đã xóa giỏ hàng');
      setShowClearDialog(false);
      onSaved?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể xóa giỏ hàng',
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-4xl">
          <SheetHeader className="shrink-0">
            <SheetTitle>Chi tiết giỏ hàng {cart ? `#${cart.id}` : ''}</SheetTitle>
            <SheetDescription>Xem chi tiết các sản phẩm trong giỏ hàng</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
            {loading ? (
              <div className="py-8 text-center">Đang tải...</div>
            ) : !cart ? (
              <div className="py-8 text-center">Không tìm thấy giỏ hàng</div>
            ) : (
              <div className="space-y-6 py-4">
                {cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingCart className="text-muted-foreground mb-4 size-12" />
                    <p className="text-muted-foreground">Giỏ hàng trống</p>
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
                            <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                              Số lượng
                            </TableHead>
                            <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                              Tổng
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.items.map(item => (
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
                                    <p className="text-muted-foreground text-sm">
                                      Còn {item.product.stock} sản phẩm
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatCurrency(item.product.price)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
                              <TableCell className="text-right font-medium whitespace-nowrap">
                                {formatCurrency(item.subtotal)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span>{formatCurrency(cart.total)}</span>
                        </div>
                        <p className="text-muted-foreground text-right text-sm">
                          {cart.totalItems} sản phẩm
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {cart && cart.items.length > 0 && (
            <SheetFooter className="bg-background shrink-0 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
                <Trash2 className="mr-2 size-4" />
                Xóa giỏ hàng
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCart}>Xóa giỏ hàng</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

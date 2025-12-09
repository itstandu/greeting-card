'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { clearUserCart, getUserCart } from '@/services';
import { CartResponse } from '@/types';
import { Search, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CartManager() {
  const [userId, setUserId] = useState('');
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const fetchCart = async () => {
    if (!userId || isNaN(Number(userId))) {
      toast.error('Vui lòng nhập User ID hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const response = await getUserCart(Number(userId));
      setCart(response.data);

      if (response.data.items.length === 0) {
        toast.info('Giỏ hàng trống');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải giỏ hàng',
      });
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!userId) return;

    try {
      await clearUserCart(Number(userId));
      toast.success('Đã xóa giỏ hàng');
      setCart(null);
      setShowClearDialog(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể xóa giỏ hàng',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm giỏ hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="Nhập User ID..."
              value={userId}
              onChange={e => setUserId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchCart()}
            />
            <Button onClick={fetchCart} disabled={loading}>
              <Search className="mr-2 size-4" />
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="border-primary mb-4 size-12 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground">Đang tải giỏ hàng...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial State - Chưa tìm kiếm */}
      {!loading && !searched && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <ShoppingCart className="text-muted-foreground mb-4 size-16" />
              <p className="text-muted-foreground text-lg font-medium">
                Nhập User ID để xem giỏ hàng
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Chức năng này giúp hỗ trợ khách hàng khi có vấn đề với giỏ hàng
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Display */}
      {!loading && searched && cart && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Giỏ hàng của User #{userId}</CardTitle>
            {cart.items.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setShowClearDialog(true)}>
                <Trash2 className="mr-2 size-4" />
                Xóa giỏ hàng
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground">Giỏ hàng trống</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead className="text-right">Tổng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.product.imageUrl && (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="size-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-muted-foreground text-sm">
                                Còn {item.product.stock} sản phẩm
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.product.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                  <div className="w-64 space-y-2">
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
          </CardContent>
        </Card>
      )}

      {/* Clear Cart Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng của user này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCart}>Xóa giỏ hàng</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

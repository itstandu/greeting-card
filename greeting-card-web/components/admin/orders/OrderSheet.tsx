'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
} from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getOrderDetailAdmin, getOrderStatusHistoryAdmin } from '@/services';
import { Order, OrderStatusHistory } from '@/types';
import { toast } from 'sonner';

type OrderSheetProps = {
  open: boolean;
  orderId: number | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function OrderSheet({ open, orderId, onOpenChange }: OrderSheetProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId || isNaN(orderId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [orderResponse, historyResponse] = await Promise.all([
        getOrderDetailAdmin(orderId),
        getOrderStatusHistoryAdmin(orderId),
      ]);
      setOrder(orderResponse.data);
      setStatusHistory(historyResponse.data || []);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải thông tin đơn hàng',
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetail();
    } else {
      setOrder(null);
      setStatusHistory([]);
    }
  }, [open, orderId, fetchOrderDetail]);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-4xl">
        <SheetHeader className="shrink-0">
          <SheetTitle>{order ? `Đơn hàng ${order.orderNumber}` : 'Chi tiết đơn hàng'}</SheetTitle>
          <SheetDescription>{order && `Đặt lúc ${formatDate(order.orderDate)}`}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground flex items-center gap-2">
                <Spinner />
                <span>Đang tải...</span>
              </div>
            </div>
          ) : !order ? (
            <div className="py-8 text-center">Không tìm thấy đơn hàng</div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={getOrderStatusColor(order.status)}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
                <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Badge>
              </div>

              {/* Thông tin đơn hàng - Gom chung tất cả */}
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Thông tin đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sản phẩm */}
                  <div>
                    <h3 className="mb-3 font-semibold">Sản phẩm</h3>
                    <div className="space-y-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="size-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-muted-foreground text-sm">
                              {formatCurrency(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tổng tiền hàng:</span>
                          <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Giảm giá{order.couponCode && ` (${order.couponCode})`}:</span>
                            <span>-{formatCurrency(order.discountAmount)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span>{formatCurrency(order.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Thông tin giao hàng */}
                  <div>
                    <h3 className="mb-3 font-semibold">Thông tin giao hàng</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">{order.shippingAddress.recipientName}</p>
                        <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                      </div>
                      <div className="text-muted-foreground">
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {[
                            order.shippingAddress.ward,
                            order.shippingAddress.district,
                            order.shippingAddress.city,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Thông tin thanh toán */}
                  <div>
                    <h3 className="mb-3 font-semibold">Thanh toán</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Phương thức:</span>
                        <span className="font-medium">{order.paymentMethod.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái:</span>
                        <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú khách hàng */}
                  {order.notes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-3 font-semibold">Ghi chú khách hàng</h3>
                        <p className="text-muted-foreground text-sm">{order.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Lịch sử trạng thái */}
              {statusHistory.length > 0 && (
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>Lịch sử trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statusHistory.map(history => (
                        <div key={history.id} className="border-primary border-l-2 pl-3">
                          <div className="flex items-center justify-between">
                            <Badge className={getOrderStatusColor(history.status)}>
                              {getOrderStatusLabel(history.status)}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {formatDate(history.createdAt)}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Thay đổi bởi: {history.changedBy}
                          </p>
                          {history.notes && (
                            <p className="text-muted-foreground mt-1 text-xs italic">
                              Ghi chú admin: {history.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

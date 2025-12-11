'use client';

import { useEffect, useState } from 'react';
import { PaymentProcessing } from '@/components/payment';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getOrderDetail, getOrderStatusHistory } from '@/services/order.service';
import type { Order, OrderItem, OrderStatusHistory } from '@/types';
import { Clock, CreditCard, Gift, History, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';

const getPromotionTypeLabel = (type: OrderItem['promotionType']) => {
  switch (type) {
    case 'DISCOUNT':
      return 'Giảm giá';
    case 'BOGO':
      return 'Mua 1 tặng 1';
    case 'BUY_X_GET_Y':
      return 'Mua X tặng Y';
    case 'BUY_X_PAY_Y':
      return 'Mua X trả Y';
    default:
      return type;
  }
};

interface OrderDetailSheetProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdate?: () => void;
}

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
  onOrderUpdate,
}: OrderDetailSheetProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetail();
      fetchStatusHistory();
    } else {
      setOrder(null);
      setStatusHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const response = await getOrderDetail(orderId);
      setOrder(response.data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error('Không thể tải chi tiết đơn hàng', {
        description: message,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    if (!orderId) return;

    try {
      setLoadingHistory(true);
      const response = await getOrderStatusHistory(orderId);
      setStatusHistory(response.data || []);
    } catch (error: unknown) {
      console.error('Failed to fetch status history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (orderId) {
      fetchOrderDetail();
      onOrderUpdate?.();
    }
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{order ? `Đơn hàng ${order.orderNumber}` : 'Chi tiết đơn hàng'}</SheetTitle>
          <SheetDescription>{order && `Đặt lúc ${formatDate(order.orderDate)}`}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Status & Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">Trạng thái:</span>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">Thanh toán:</span>
                    </div>
                    <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Processing */}
              {order.paymentStatus === 'PENDING' && order.paymentMethod && (
                <PaymentProcessing
                  order={order}
                  paymentMethod={order.paymentMethod}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Tổng kết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền:</span>
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giảm giá:</span>
                      <span className="font-semibold text-green-600">
                        -{formatCurrency(order.discountAmount)}
                      </span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã giảm giá:</span>
                      <span className="font-semibold">{order.couponCode}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Thành tiền:</span>
                    <span className="text-primary text-lg font-bold">
                      {formatCurrency(order.finalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Địa chỉ giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{order.shippingAddress.recipientName}</p>
                      <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                      <p className="text-muted-foreground">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 &&
                          `, ${order.shippingAddress.addressLine2}`}
                      </p>
                      <p className="text-muted-foreground">
                        {[
                          order.shippingAddress.ward,
                          order.shippingAddress.district,
                          order.shippingAddress.city,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {order.shippingAddress.postalCode && (
                        <p className="text-muted-foreground">
                          Mã bưu điện: {order.shippingAddress.postalCode}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              {order.paymentMethod && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Phương thức thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{order.paymentMethod.name}</p>
                    {order.paymentMethod.description && (
                      <p className="text-muted-foreground text-sm">
                        {order.paymentMethod.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                          <SafeImage
                            src={item.productImage || '/placeholder.jpg'}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted-foreground text-sm">
                            Số lượng: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                          {/* Hiển thị thông tin khuyến mãi sản phẩm */}
                          {item.promotionName && (
                            <div className="mt-1 flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {getPromotionTypeLabel(item.promotionType)}: {item.promotionName}
                              </Badge>
                              {item.promotionDiscountAmount && item.promotionDiscountAmount > 0 && (
                                <span className="text-xs text-green-600">
                                  (-{formatCurrency(item.promotionDiscountAmount)})
                                </span>
                              )}
                            </div>
                          )}
                          <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}

                    {/* Hiển thị sản phẩm tặng */}
                    {order.items.some(
                      item => item.promotionQuantityFree && item.promotionQuantityFree > 0,
                    ) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-600">
                            <Gift className="size-4" />
                            Sản phẩm tặng kèm
                          </h4>
                          <div className="space-y-2">
                            {order.items
                              .filter(
                                item =>
                                  item.promotionQuantityFree && item.promotionQuantityFree > 0,
                              )
                              .map(item => (
                                <div
                                  key={`gift-${item.id}`}
                                  className="flex items-center gap-3 rounded-md bg-green-50 p-2"
                                >
                                  <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded">
                                    <SafeImage
                                      src={item.productImage || '/placeholder.jpg'}
                                      alt={item.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.productName}</p>
                                    <p className="text-xs text-green-600">
                                      Tặng {item.promotionQuantityFree} sản phẩm
                                      {item.promotionName && ` (${item.promotionName})`}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-600"
                                  >
                                    Miễn phí
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Lịch sử trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner />
                    </div>
                  ) : statusHistory.length > 0 ? (
                    <div className="space-y-4">
                      {statusHistory.map((history, index) => (
                        <div key={history.id} className="relative">
                          {index < statusHistory.length - 1 && (
                            <div className="bg-border absolute top-8 left-3 h-full w-0.5" />
                          )}
                          <div className="flex gap-3">
                            <div
                              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${getOrderStatusColor(history.status)}`}
                            >
                              <Clock className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={getOrderStatusColor(history.status)}
                                >
                                  {getOrderStatusLabel(history.status)}
                                </Badge>
                                <span className="text-muted-foreground text-xs">
                                  {formatDate(history.createdAt)}
                                </span>
                              </div>
                              {history.notes && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {history.notes}
                                </p>
                              )}
                              <p className="text-muted-foreground mt-1 text-xs">
                                Thay đổi bởi: {history.changedBy}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Chưa có lịch sử trạng thái</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

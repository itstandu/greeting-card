'use client';

import { useEffect, useState } from 'react';
import { PaymentProcessing } from '@/components/payment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getOrderDetail, getOrderPayments, getUserOrders } from '@/services';
import type { Order, OrderSimple, Payment } from '@/types';
import { Eye, Package } from 'lucide-react';
import { toast } from 'sonner';

export function UserOrdersClient() {
  const [orders, setOrders] = useState<OrderSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderPayments, setOrderPayments] = useState<Payment[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      setOrders(response.data || []);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      setSheetOpen(true);
      const [orderResponse, paymentsResponse] = await Promise.all([
        getOrderDetail(orderId),
        getOrderPayments(orderId),
      ]);
      setSelectedOrder(orderResponse.data);
      setOrderPayments(paymentsResponse.data || []);
    } catch {
      toast.error('Không thể tải chi tiết đơn hàng');
      setSheetOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (selectedOrder) {
      handleViewOrder(selectedOrder.id);
    }
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <Package className="text-muted-foreground h-16 w-16" />
          <h2 className="text-2xl font-semibold">Chưa có đơn hàng</h2>
          <p className="text-muted-foreground max-w-md text-center">
            Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <Card key={order.id} className="py-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">Đơn hàng {order.orderNumber}</CardTitle>
                  <CardDescription>
                    Đặt lúc {formatDate(order.orderDate)} • {order.totalItems} sản phẩm
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Tổng tiền</p>
                  <p className="text-lg font-semibold">{formatCurrency(order.finalAmount)}</p>
                </div>
                <Button variant="outline" onClick={() => handleViewOrder(order.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {selectedOrder ? `Đơn hàng ${selectedOrder.orderNumber}` : 'Chi tiết đơn hàng'}
            </SheetTitle>
            <SheetDescription>
              {selectedOrder && `Đặt lúc ${formatDate(selectedOrder.orderDate)}`}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6 py-4">
                {/* Order Info */}
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>Thông tin đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge className={getOrderStatusColor(selectedOrder.status)}>
                        {getOrderStatusLabel(selectedOrder.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thanh toán:</span>
                      <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng tiền:</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Giảm giá:</span>
                        <span className="text-green-600">
                          -{formatCurrency(selectedOrder.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Thành tiền:</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(selectedOrder.finalAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Processing */}
                {selectedOrder.paymentStatus === 'PENDING' && selectedOrder.paymentMethod && (
                  <PaymentProcessing
                    order={selectedOrder}
                    paymentMethod={selectedOrder.paymentMethod}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                )}

                {/* Payment History */}
                {orderPayments.length > 0 && (
                  <Card className="py-6">
                    <CardHeader>
                      <CardTitle>Lịch sử thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {orderPayments.map(payment => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between border-b pb-3 last:border-0"
                          >
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount)}</p>
                              <p className="text-muted-foreground text-sm">
                                {payment.transactionId} • {formatDate(payment.createdAt)}
                              </p>
                            </div>
                            <Badge className={getPaymentStatusColor(payment.status)}>
                              {getPaymentStatusLabel(payment.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Items */}
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>Sản phẩm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items?.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <img
                            src={item.productImage || '/placeholder.jpg'}
                            alt={item.productName}
                            className="h-20 w-20 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-muted-foreground text-sm">
                              Số lượng: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

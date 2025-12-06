'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getOrderDetail } from '@/services/order.service';
import { processPayment } from '@/services/payment.service';
import type { Order } from '@/types';
import { AxiosError } from 'axios';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, XCircle } from 'lucide-react';

type PaymentStatus = 'processing' | 'success' | 'failed';

export default function PaymentProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const orderId = params?.orderId ? Number(params.orderId) : null;

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy đơn hàng');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await getOrderDetail(orderId);
        if (response.data) {
          setOrder(response.data);

          // Nếu đã thanh toán rồi, hiển thị success
          if (response.data.paymentStatus === 'PAID') {
            setPaymentStatus('success');
            setLoading(false);
            return;
          }

          // Nếu COD, không cần thanh toán
          if (response.data.paymentMethod.code === 'COD') {
            setPaymentStatus('success');
            setLoading(false);
            return;
          }

          // Bắt đầu xử lý thanh toán tự động
          processPaymentWithDelay(response.data);
        }
      } catch (err: unknown) {
        let errorMessage = 'Không thể tải thông tin đơn hàng';
        if (err instanceof AxiosError && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Xử lý thanh toán với setTimeout simulation
  const processPaymentWithDelay = async (orderData: Order) => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      // Giả lập delay 2-3 giây để xử lý thanh toán
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      // Gọi API thanh toán
      const paymentResponse = await processPayment({
        orderId: orderData.id,
        // Có thể thêm thông tin thanh toán tùy theo payment method
        // Nhưng vì đây là giả lập nên không cần
      });

      if (paymentResponse.data && paymentResponse.data.status === 'PAID') {
        setPaymentStatus('success');
        toast({
          title: '🎉 Thanh toán thành công!',
          description: `Đơn hàng ${orderData.orderNumber} đã được thanh toán thành công.`,
        });
      } else {
        setPaymentStatus('failed');
        setError(paymentResponse.data?.failureReason || 'Thanh toán thất bại');
        toast({
          title: 'Thanh toán thất bại',
          description: paymentResponse.data?.failureReason || 'Vui lòng thử lại sau.',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      let errorMessage = 'Có lỗi xảy ra khi xử lý thanh toán';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setPaymentStatus('failed');
      setError(errorMessage);
      toast({
        title: 'Lỗi thanh toán',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <Card className="py-6">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
              <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <Card className="py-6">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <XCircle className="text-destructive mb-4 h-12 w-12" />
              <p className="mb-4 text-lg font-semibold">Lỗi</p>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => router.push('/orders')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đơn hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Processing State */}
        {paymentStatus === 'processing' && (
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
                Đang xử lý thanh toán
              </CardTitle>
              <CardDescription>
                Vui lòng đợi trong giây lát, chúng tôi đang xử lý thanh toán cho đơn hàng{' '}
                <span className="font-semibold">{order.orderNumber}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số tiền thanh toán:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phương thức thanh toán:</span>
                  <span className="font-medium">{order.paymentMethod.name}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground text-sm">Đang kết nối với cổng thanh toán...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {paymentStatus === 'success' && (
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Thanh toán thành công!
              </CardTitle>
              <CardDescription>
                Đơn hàng <span className="font-semibold">{order.orderNumber}</span> đã được thanh
                toán thành công.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-semibold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số tiền đã thanh toán:</span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phương thức thanh toán:</span>
                  <span className="font-medium">{order.paymentMethod.name}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" onClick={() => router.push(`/orders`)}>
                  Xem đơn hàng của tôi
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
                  Tiếp tục mua sắm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {paymentStatus === 'failed' && (
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Thanh toán thất bại
              </CardTitle>
              <CardDescription>
                Không thể xử lý thanh toán cho đơn hàng{' '}
                <span className="font-semibold">{order.orderNumber}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-semibold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số tiền:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.finalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setPaymentStatus('processing');
                    processPaymentWithDelay(order);
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Thử lại thanh toán
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push('/orders')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đơn hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back link */}
        <div className="mt-4">
          <Link
            href="/orders"
            className="text-muted-foreground hover:text-primary inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}

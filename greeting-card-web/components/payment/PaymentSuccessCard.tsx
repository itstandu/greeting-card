'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/types';
import { CheckCircle2 } from 'lucide-react';

interface PaymentSuccessCardProps {
  order: Order;
}

export function PaymentSuccessCard({ order }: PaymentSuccessCardProps) {
  const router = useRouter();
  const isCOD = order.paymentMethod.code === 'COD';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-6 w-6" />
          {isCOD ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
        </CardTitle>
        <CardDescription>
          {isCOD ? (
            <>
              Đơn hàng <span className="font-semibold">{order.orderNumber}</span> đã được đặt thành
              công. Bạn sẽ thanh toán khi nhận hàng.
            </>
          ) : (
            <>
              Đơn hàng <span className="font-semibold">{order.orderNumber}</span> đã được thanh toán
              thành công.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mã đơn hàng:</span>
            <span className="font-semibold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {isCOD ? 'Số tiền cần thanh toán:' : 'Số tiền đã thanh toán:'}
            </span>
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
          {isCOD && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái thanh toán:</span>
              <span className="font-medium text-amber-600">Chờ thanh toán khi nhận hàng</span>
            </div>
          )}
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
  );
}

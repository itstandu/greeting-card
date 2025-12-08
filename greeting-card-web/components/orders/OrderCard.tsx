'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderSimple } from '@/types';
import { Eye, Package } from 'lucide-react';

interface OrderCardProps {
  order: OrderSimple;
  onViewDetail: (orderId: number) => void;
}

export function OrderCard({ order, onViewDetail }: OrderCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="mb-2 text-lg">
              <Link
                href={`/orders/${order.id}`}
                className="hover:text-primary transition-colors"
                onClick={e => {
                  e.preventDefault();
                  onViewDetail(order.id);
                }}
              >
                Đơn hàng {order.orderNumber}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>
                Đặt lúc {formatDate(order.orderDate)} • {order.totalItems} sản phẩm
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getOrderStatusColor(order.status)}>
              {getOrderStatusLabel(order.status)}
            </Badge>
            <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
              {getPaymentStatusLabel(order.paymentStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Tổng tiền</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(order.finalAmount)}</p>
          </div>
          <Button variant="outline" onClick={() => onViewDetail(order.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


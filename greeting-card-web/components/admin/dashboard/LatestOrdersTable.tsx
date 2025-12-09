'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderSimple } from '@/types';

type LatestOrdersTableProps = {
  orders: OrderSimple[];
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export function LatestOrdersTable({ orders }: LatestOrdersTableProps) {
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderClick = (orderId: number) => {
    // Navigate to orders page with orderId in query params
    router.push(`/admin/orders?orderId=${orderId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng mới nhất</CardTitle>
        <CardDescription>Danh sách các đơn hàng gần đây</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Mã đơn</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Ngày đặt
                </TableHead>
                <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                  Số lượng
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Tổng tiền
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Trạng thái
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Chưa có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="whitespace-nowrap">
                      <button
                        onClick={() => handleOrderClick(order.id)}
                        className="cursor-pointer font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{order.totalItems}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatCurrency(order.finalAmount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={statusColors[order.status]} variant="secondary">
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

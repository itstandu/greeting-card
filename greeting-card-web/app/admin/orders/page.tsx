import { Metadata } from 'next';
import { OrderList } from '@/components/admin/orders';

export const metadata: Metadata = {
  title: 'Quản lý đơn hàng | Admin',
  description: 'Quản lý đơn hàng',
};

export default function AdminOrdersPage() {
  return <OrderList />;
}

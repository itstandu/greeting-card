import { Metadata } from 'next';
import { CartList } from '@/components/admin/carts';

export const metadata: Metadata = {
  title: 'Quản lý giỏ hàng | Admin',
  description: 'Xem giỏ hàng của users',
};

export default function AdminCartsPage() {
  return <CartList />;
}

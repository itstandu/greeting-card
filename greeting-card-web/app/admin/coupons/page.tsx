import { Metadata } from 'next';
import { CouponList } from '@/components/admin/coupons';

export const metadata: Metadata = {
  title: 'Quản lý giảm giá | Admin',
  description: 'Quản lý mã giảm giá (coupons)',
};

export default function AdminCouponsPage() {
  return <CouponList />;
}

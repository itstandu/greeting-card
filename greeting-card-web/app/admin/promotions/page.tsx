import { Metadata } from 'next';
import { PromotionList } from '@/components/admin/promotions';

export const metadata: Metadata = {
  title: 'Quản lý khuyến mãi | Admin',
  description: 'Quản lý khuyến mãi (BOGO, mua X tặng Y, mua X tính tiền Y)',
};

export default function AdminPromotionsPage() {
  return <PromotionList />;
}

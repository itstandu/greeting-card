import { CouponList } from '@/components/admin/coupons';
import { PromotionList } from '@/components/admin/promotions';

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <CouponList />
      <PromotionList />
    </div>
  );
}

import type { Metadata } from 'next';
import { CareersBenefits } from '@/components/careers/CareersBenefits';
import { CareersCTA } from '@/components/careers/CareersCTA';
import { CareersCulture } from '@/components/careers/CareersCulture';
import { CareersHero } from '@/components/careers/CareersHero';
import { CareersOpenPositions } from '@/components/careers/CareersOpenPositions';
import { CareersProcess } from '@/components/careers/CareersProcess';

export const metadata: Metadata = {
  title: 'Tuyển dụng - Greeting Card',
  description:
    'Tham gia đội ngũ Greeting Card - Nơi sáng tạo và đổi mới gặp nhau. Tìm hiểu về cơ hội nghề nghiệp và văn hóa làm việc của chúng tôi.',
};

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CareersHero />
      <CareersBenefits />
      <CareersOpenPositions />
      <CareersCulture />
      <CareersProcess />
      <CareersCTA />
    </div>
  );
}

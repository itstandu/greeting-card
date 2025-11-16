import type { Metadata } from 'next';
import { PrivacyContent } from '@/components/privacy/PrivacyContent';
import { PrivacyCTA } from '@/components/privacy/PrivacyCTA';
import { PrivacyHero } from '@/components/privacy/PrivacyHero';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật - Greeting Card',
  description:
    'Chính sách bảo mật thông tin của Greeting Card. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PrivacyHero />
      <PrivacyContent />
      <PrivacyCTA />
    </div>
  );
}

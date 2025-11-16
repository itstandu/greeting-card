import type { Metadata } from 'next';
import { TermsContent } from '@/components/terms/TermsContent';
import { TermsCTA } from '@/components/terms/TermsCTA';
import { TermsHero } from '@/components/terms/TermsHero';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng - Greeting Card',
  description:
    'Điều khoản và điều kiện sử dụng dịch vụ Greeting Card. Vui lòng đọc kỹ trước khi sử dụng.',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TermsHero />
      <TermsContent />
      <TermsCTA />
    </div>
  );
}

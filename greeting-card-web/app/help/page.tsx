import type { Metadata } from 'next';
import { HelpCategories } from '@/components/help/HelpCategories';
import { HelpCTA } from '@/components/help/HelpCTA';
import { HelpFAQ } from '@/components/help/HelpFAQ';
import { HelpHero } from '@/components/help/HelpHero';
import { HelpResources } from '@/components/help/HelpResources';

export const metadata: Metadata = {
  title: 'Trung tâm trợ giúp - Greeting Card',
  description:
    'Tìm câu trả lời cho các câu hỏi thường gặp, hướng dẫn sử dụng và liên hệ với đội ngũ hỗ trợ của Greeting Card.',
};

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HelpHero />
      <HelpCategories />
      <HelpFAQ />
      <HelpResources />
      <HelpCTA />
    </div>
  );
}

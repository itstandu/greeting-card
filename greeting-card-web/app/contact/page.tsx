import type { Metadata } from 'next';
import { ContactCTA } from '@/components/contact/ContactCTA';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { ContactMap } from '@/components/contact/ContactMap';

export const metadata: Metadata = {
  title: 'Liên hệ - Greeting Card',
  description:
    'Liên hệ với đội ngũ Greeting Card - Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn.',
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactMap />
      <ContactCTA />
    </div>
  );
}

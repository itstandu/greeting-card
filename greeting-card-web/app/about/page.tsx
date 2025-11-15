import type { Metadata } from 'next';
import { AboutCTA } from '@/components/about/AboutCTA';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutMission } from '@/components/about/AboutMission';
import { AboutStats } from '@/components/about/AboutStats';
import { AboutTeam } from '@/components/about/AboutTeam';
import { AboutTimeline } from '@/components/about/AboutTimeline';
import { AboutValues } from '@/components/about/AboutValues';

export const metadata: Metadata = {
  title: 'Về chúng tôi - Greeting Card',
  description:
    'Tìm hiểu về sứ mệnh, giá trị và đội ngũ của Greeting Card - nền tảng thiệp chúc mừng trực tuyến hàng đầu.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutStats />
      <AboutTimeline />
      <AboutTeam />
      <AboutCTA />
    </div>
  );
}

import { AboutSection } from '@/components/home/AboutSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { CTASection } from '@/components/home/CTASection';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HeroSection } from '@/components/home/HeroSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <AboutSection />
      <FeaturedProductsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

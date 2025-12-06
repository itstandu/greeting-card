'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search } from 'lucide-react';

export function HelpHero() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Scroll to FAQ section
      const faqSection = document.getElementById('faq-section');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="from-muted/50 via-background to-background relative overflow-hidden bg-linear-to-b pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Trung tâm trợ giúp</span>
          </div>
          <h1 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Chúng tôi ở đây để{' '}
            <span className="from-primary to-accent-foreground bg-linear-to-r bg-clip-text text-transparent">
              hỗ trợ bạn
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
            Tìm câu trả lời nhanh chóng cho các câu hỏi thường gặp, hướng dẫn chi tiết và liên hệ
            với đội ngũ hỗ trợ của chúng tôi.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-14 rounded-full border-2 pr-32 pl-12 text-lg shadow-lg focus-visible:ring-2"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute top-1/2 right-2 h-10 -translate-y-1/2 rounded-full px-6"
              >
                Tìm kiếm
              </Button>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">
              Tìm kiếm phổ biến: thanh toán, giao hàng, đổi trả, tài khoản
            </p>
          </form>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-accent/20 absolute top-0 right-0 -z-10 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-secondary/20 absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full blur-3xl" />
    </section>
  );
}

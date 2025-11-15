'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const { isAuthenticated, hasCheckedAuth } = useAuth();

  // Chỉ hiển thị khi đã check auth và chưa đăng nhập
  if (hasCheckedAuth && isAuthenticated) {
    return null;
  }

  return (
    <section className="bg-primary relative overflow-hidden py-24">
      {/* Background patterns */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden opacity-10">
        <div className="bg-primary-foreground absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"></div>
        <div className="bg-primary-foreground absolute top-1/2 right-0 h-64 w-64 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-primary-foreground mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Tìm tấm thiệp hoàn hảo cho người thương
        </h2>
        <p className="text-primary-foreground/80 mx-auto mb-10 max-w-2xl text-xl">
          Khám phá bộ sưu tập thiệp độc đáo và gửi đi những lời chúc ý nghĩa ngay hôm nay.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 rounded-full px-8 text-lg shadow-lg"
          >
            <Link href="/products">
              Mua sắm ngay <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50 h-12 rounded-full px-8 text-lg backdrop-blur-sm"
          >
            <Link href="/auth/register">Đăng ký thành viên</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

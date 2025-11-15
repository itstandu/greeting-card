import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="from-muted/50 to-background relative overflow-hidden bg-gradient-to-b pt-24 pb-16 lg:pt-40 lg:pb-32">
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Gửi yêu thương trong tích tắc</span>
          </div>
          <h1 className="text-foreground mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Kết nối trái tim qua từng <span className="text-primary">tấm thiệp</span>
          </h1>
          <p className="text-muted-foreground mb-10 text-xl sm:px-16 lg:px-24">
            Tạo và gửi những tấm thiệp điện tử độc đáo, mang đậm dấu ấn cá nhân. Chia sẻ khoảnh khắc
            đáng nhớ với người thân yêu chỉ trong vài cú nhấp chuột.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-8 text-lg shadow-lg transition-all hover:shadow-xl"
            >
              <Link href="/products">
                Mua sắm ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8 text-lg">
              <Link href="/categories">Xem danh mục</Link>
            </Button>
          </div>
        </div>

        {/* Abstract shapes/decoration */}
        <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-accent/20 absolute top-0 right-0 -z-10 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

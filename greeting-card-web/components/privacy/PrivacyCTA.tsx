import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Shield } from 'lucide-react';

export function PrivacyCTA() {
  return (
    <section className="from-primary via-primary/90 to-accent-foreground text-primary-foreground bg-linear-to-br py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="bg-primary-foreground/20 mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Shield className="mr-2 h-4 w-4" />
            <span>Thông tin pháp lý</span>
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Tìm hiểu thêm về điều khoản sử dụng
          </h2>
          <p className="text-primary-foreground/90 mb-10 text-lg sm:text-xl">
            Xem các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi để hiểu rõ quyền và nghĩa
            vụ của bạn khi sử dụng dịch vụ.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-full px-8 text-lg shadow-lg transition-all hover:shadow-xl"
            >
              <Link href="/terms">
                <FileText className="mr-2 h-5 w-5" />
                Điều khoản sử dụng
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50 h-12 rounded-full border-2 px-8 text-lg backdrop-blur-sm transition-all"
            >
              <Link href="/contact">
                Liên hệ với chúng tôi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

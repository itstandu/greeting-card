import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, HelpCircle, MessageSquare } from 'lucide-react';

export function HelpCTA() {
  return (
    <section className="from-primary via-primary/90 to-accent-foreground text-primary-foreground bg-linear-to-br py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="bg-primary-foreground/20 mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Cần thêm hỗ trợ?</span>
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Vẫn chưa tìm thấy câu trả lời?
          </h2>
          <p className="text-primary-foreground/90 mb-10 text-lg sm:text-xl">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn. Hãy liên hệ với chúng tôi và
            chúng tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-full px-8 text-lg shadow-lg transition-all hover:shadow-xl"
            >
              <Link href="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Liên hệ với chúng tôi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50 h-12 rounded-full border-2 px-8 text-lg backdrop-blur-sm transition-all"
            >
              <Link href="/about">
                Tìm hiểu thêm về chúng tôi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AboutSection() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="from-primary/10 to-accent/10 flex aspect-4/3 items-center justify-center bg-linear-to-br">
                <span className="text-muted-foreground font-medium">About Image Placeholder</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-foreground mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Sứ mệnh kết nối yêu thương
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Chúng tôi tin rằng mỗi lời chúc đều mang một sức mạnh đặc biệt. Đó không chỉ là những
              dòng chữ, mà là tình cảm, là sự quan tâm chân thành gửi đến người nhận.
            </p>
            <p className="text-muted-foreground mb-8 text-lg">
              Với nền tảng của chúng tôi, việc tạo ra những tấm thiệp đẹp mắt, ý nghĩa chưa bao giờ
              dễ dàng đến thế. Hãy để chúng tôi giúp bạn trao gửi những thông điệp yêu thương một
              cách trọn vẹn nhất.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/about">Tìm hiểu thêm về chúng tôi</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

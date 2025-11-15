import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2 } from 'lucide-react';

const milestones = [
  {
    year: '2020',
    title: 'Khởi đầu',
    description:
      'Ra mắt nền tảng với 100 mẫu thiệp đầu tiên, phục vụ khách hàng tại Hà Nội và TP.HCM.',
  },
  {
    year: '2021',
    title: 'Mở rộng',
    description:
      'Mở rộng danh mục sản phẩm lên 1,000+ mẫu thiệp, phục vụ khách hàng trên toàn quốc.',
  },
  {
    year: '2022',
    title: 'Đổi mới',
    description:
      'Ra mắt tính năng tùy chỉnh thiệp, cho phép khách hàng thêm ảnh và lời chúc cá nhân.',
  },
  {
    year: '2023',
    title: 'Phát triển',
    description:
      'Đạt mốc 10,000+ khách hàng, hợp tác với các nhà thiết kế hàng đầu để tạo ra bộ sưu tập độc quyền.',
  },
  {
    year: '2024',
    title: 'Phát triển mạnh mẽ',
    description:
      'Tiếp tục phát triển với 5,000+ sản phẩm, công nghệ AI hỗ trợ tạo thiệp thông minh, và dịch vụ chăm sóc khách hàng 24/7.',
  },
  {
    year: '2025',
    title: 'Hiện tại',
    description:
      'Mở rộng thị trường quốc tế, ra mắt ứng dụng di động, tích hợp công nghệ AR/VR để tạo trải nghiệm thiệp sống động và tương tác hơn.',
  },
];

export function AboutTimeline() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Hành trình phát triển
          </h2>
          <p className="text-muted-foreground text-lg">
            Những cột mốc quan trọng trong hành trình xây dựng và phát triển của chúng tôi.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="from-primary/30 via-primary to-primary/30 absolute top-0 left-8 hidden h-full w-0.5 bg-gradient-to-b md:block" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-start gap-6 md:gap-8">
                {/* Timeline dot */}
                <div className="relative z-10 flex shrink-0 items-center justify-center">
                  <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                    <CheckCircle2 className="text-primary-foreground h-8 w-8" />
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="bg-primary/50 absolute top-16 left-1/2 hidden h-12 w-0.5 -translate-x-1/2 md:block" />
                  )}
                </div>

                {/* Content */}
                <Card className="hover:border-primary/50 flex-1 border-2 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>{milestone.year}</span>
                    </div>
                    <h3 className="text-foreground mb-2 text-xl font-semibold">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

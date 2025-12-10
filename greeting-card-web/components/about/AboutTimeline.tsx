import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2 } from 'lucide-react';

const milestones = [
  {
    year: '2023',
    title: 'Ý tưởng đầu tiên',
    description:
      'Nhóm sinh viên IT nhận thấy nhu cầu thiệp chúc mừng online tăng cao sau đại dịch. Bắt đầu nghiên cứu thị trường và lên kế hoạch phát triển nền tảng.',
  },
  {
    year: 'Q1 2024',
    title: 'MVP đầu tiên',
    description:
      'Ra mắt phiên bản beta với 50 mẫu thiệp cơ bản. Nhận được phản hồi tích cực từ 200 khách hàng đầu tiên. Học được nhiều bài học về UX và quy trình đặt hàng.',
  },
  {
    year: 'Q2 2024',
    title: 'Cải thiện và mở rộng',
    description:
      'Thêm tính năng tùy chỉnh thiệp theo yêu cầu. Mở rộng đội ngũ thiết kế từ 2 lên 5 người. Đạt 1,000 đơn hàng đầu tiên và nhận được đánh giá 4.5/5 sao từ khách hàng.',
  },
  {
    year: 'Q3 2024',
    title: 'Tối ưu hóa hệ thống',
    description:
      'Gặp vấn đề về hiệu suất khi lượng truy cập tăng đột biến. Nâng cấp server và tối ưu database. Ra mắt tính năng theo dõi đơn hàng real-time và thông báo email tự động.',
  },
  {
    year: 'Q4 2024',
    title: 'Phát triển bền vững',
    description:
      'Đạt 5,000 khách hàng thân thiết. Hợp tác với các nhà in uy tín để đảm bảo chất lượng sản phẩm. Mở rộng dịch vụ giao hàng đến 63 tỉnh thành. Bắt đầu nghiên cứu tính năng thiệp điện tử.',
  },
  {
    year: '2025',
    title: 'Hướng tới tương lai',
    description:
      'Tiếp tục cải thiện trải nghiệm người dùng dựa trên phản hồi khách hàng. Phát triển ứng dụng mobile và tích hợp thanh toán đa dạng hơn. Mục tiêu phục vụ 10,000 khách hàng trong năm nay.',
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

        <div className="relative mx-auto max-w-6xl">
          {/* Vertical timeline line - centered */}
          <div className="from-primary/30 via-primary to-primary/30 absolute top-0 left-1/2 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b md:block" />

          <div className="space-y-12 md:space-y-16">
            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="relative flex items-start gap-4 md:gap-8">
                  {/* Left side - Card for even items on desktop */}
                  {isEven ? (
                    <>
                      <div className="hidden flex-1 md:block">
                        <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
                          <CardContent className="px-6">
                            <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4" />
                              <span>{milestone.year}</span>
                            </div>
                            <h3 className="text-foreground mb-2 text-xl font-semibold">
                              {milestone.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      {/* Spacer for timeline dot */}
                      <div className="relative z-10 flex shrink-0 items-center justify-center">
                        <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                          <CheckCircle2 className="text-primary-foreground h-8 w-8" />
                        </div>
                        {index < milestones.length - 1 && (
                          <div className="bg-primary/50 absolute top-16 left-1/2 hidden h-12 w-0.5 -translate-x-1/2 md:block" />
                        )}
                      </div>
                      {/* Empty space on right for even items */}
                      <div className="hidden flex-1 md:block" />
                      {/* Mobile view - card on right */}
                      <div className="flex-1 md:hidden">
                        <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
                          <CardContent className="px-6">
                            <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4" />
                              <span>{milestone.year}</span>
                            </div>
                            <h3 className="text-foreground mb-2 text-xl font-semibold">
                              {milestone.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Empty space on left for odd items */}
                      <div className="hidden flex-1 md:block" />
                      {/* Timeline dot */}
                      <div className="relative z-10 flex shrink-0 items-center justify-center">
                        <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                          <CheckCircle2 className="text-primary-foreground h-8 w-8" />
                        </div>
                        {index < milestones.length - 1 && (
                          <div className="bg-primary/50 absolute top-16 left-1/2 hidden h-12 w-0.5 -translate-x-1/2 md:block" />
                        )}
                      </div>
                      {/* Right side - Card for odd items */}
                      <div className="flex-1">
                        <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
                          <CardContent className="px-6">
                            <div className="text-primary mb-3 flex items-center gap-2 text-sm font-medium md:flex-row-reverse md:justify-end">
                              <Calendar className="h-4 w-4" />
                              <span>{milestone.year}</span>
                            </div>
                            <h3 className="text-foreground mb-2 text-xl font-semibold md:text-right">
                              {milestone.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed md:text-right">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

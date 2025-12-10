import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, FileText, MessageSquare, UserCheck } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: FileText,
    title: 'Nộp hồ sơ',
    description: 'Gửi CV và cover letter qua email hoặc form ứng tuyển trên website.',
  },
  {
    step: 2,
    icon: MessageSquare,
    title: 'Phỏng vấn sơ bộ',
    description: 'Cuộc trò chuyện ngắn với HR để tìm hiểu về bạn và vị trí ứng tuyển.',
  },
  {
    step: 3,
    icon: UserCheck,
    title: 'Phỏng vấn chuyên môn',
    description: 'Gặp gỡ team lead và các thành viên để thảo luận về kỹ năng và kinh nghiệm.',
  },
  {
    step: 4,
    icon: CheckCircle2,
    title: 'Nhận offer',
    description: 'Nếu phù hợp, chúng tôi sẽ gửi offer và chào mừng bạn gia nhập đội ngũ!',
  },
];

export function CareersProcess() {
  return (
    <section className="from-muted/30 to-background bg-gradient-to-b py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Quy trình tuyển dụng
          </h2>
          <p className="text-muted-foreground text-lg">
            Quy trình đơn giản và minh bạch để bạn có thể tham gia đội ngũ của chúng tôi.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="from-primary/30 via-primary to-primary/30 absolute top-0 left-8 hidden h-full w-0.5 bg-gradient-to-b md:block" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-start md:items-center">
                {/* Timeline dot */}
                <div className="relative z-10 mb-6 flex shrink-0 items-center justify-center md:mb-8">
                  <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
                    <step.icon className="text-primary-foreground h-8 w-8" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="bg-primary/50 absolute top-16 left-1/2 hidden h-12 w-0.5 -translate-x-1/2 md:block lg:hidden" />
                  )}
                </div>

                {/* Content */}
                <Card className="hover:border-primary/50 flex-1 border-2 transition-all hover:shadow-lg">
                  <CardContent className="px-6 text-center">
                    <div className="text-primary mb-3 text-sm font-medium">Bước {step.step}</div>
                    <h3 className="text-foreground mb-3 text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
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

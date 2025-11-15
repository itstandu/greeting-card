'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Award, Handshake, Lightbulb, Shield, Sparkles, Zap } from 'lucide-react';

const values = [
  {
    icon: Sparkles,
    title: 'Sáng tạo',
    description: 'Luôn đổi mới và tạo ra những thiết kế độc đáo, phù hợp với xu hướng.',
  },
  {
    icon: Shield,
    title: 'Đáng tin cậy',
    description: 'Cam kết chất lượng sản phẩm và dịch vụ, đảm bảo sự hài lòng của khách hàng.',
  },
  {
    icon: Handshake,
    title: 'Tận tâm',
    description: 'Luôn lắng nghe và hỗ trợ khách hàng với thái độ chuyên nghiệp, nhiệt tình.',
  },
  {
    icon: Zap,
    title: 'Nhanh chóng',
    description: 'Giao hàng nhanh, phản hồi kịp thời, đáp ứng nhu cầu của khách hàng ngay lập tức.',
  },
  {
    icon: Lightbulb,
    title: 'Đổi mới',
    description: 'Không ngừng cải tiến công nghệ và dịch vụ để mang đến trải nghiệm tốt hơn.',
  },
  {
    icon: Award,
    title: 'Chất lượng',
    description: 'Đặt chất lượng lên hàng đầu, từ thiết kế đến dịch vụ chăm sóc khách hàng.',
  },
];

export function AboutValues() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="from-muted/30 to-background bg-gradient-to-b py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Giá trị của chúng tôi
          </h2>
          <p className="text-muted-foreground text-lg">
            Những nguyên tắc và giá trị cốt lõi định hướng mọi hoạt động của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <Card
              key={index}
              className={cn(
                'hover:border-primary/50 border-2 transition-all duration-500 hover:shadow-xl',
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <CardContent className="p-8">
                <div className="bg-primary mb-6 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <value.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-semibold">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

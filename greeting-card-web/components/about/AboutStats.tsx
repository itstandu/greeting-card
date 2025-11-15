'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart, ShoppingBag, Users } from 'lucide-react';

const stats = [
  {
    icon: Users,
    label: 'Khách hàng',
    value: 10000,
    suffix: '+',
  },
  {
    icon: ShoppingBag,
    label: 'Sản phẩm',
    value: 5000,
    suffix: '+',
  },
  {
    icon: Heart,
    label: 'Thiệp đã gửi',
    value: 50000,
    suffix: '+',
  },
  {
    icon: Award,
    label: 'Đánh giá 5 sao',
    value: 98,
    suffix: '%',
  },
];

function useCounter(end: number, duration: number = 2000, isActive: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isActive]);

  return count;
}

export function AboutStats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
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
    <section
      ref={sectionRef}
      className="from-primary to-primary/90 text-primary-foreground bg-gradient-to-b py-24"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Thành tựu của chúng tôi
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Những con số biết nói về sự tin tưởng và ủng hộ của khách hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, isVisible }: { stat: (typeof stats)[0]; isVisible: boolean }) {
  const count = useCounter(stat.value, 2000, isVisible);

  return (
    <Card className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-0 backdrop-blur-sm transition-all hover:shadow-xl">
      <CardContent className="p-8 text-center">
        <div className="bg-primary-foreground/20 mb-4 inline-flex items-center justify-center rounded-full p-3">
          <stat.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
        </div>
        <div className="text-primary-foreground mb-2 text-4xl font-extrabold">
          {count.toLocaleString('vi-VN')}
          {stat.suffix}
        </div>
        <p className="text-primary-foreground/80 text-sm font-medium">{stat.label}</p>
      </CardContent>
    </Card>
  );
}

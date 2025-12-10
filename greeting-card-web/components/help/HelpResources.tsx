'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, MessageCircle, Video } from 'lucide-react';

const resources = [
  {
    icon: BookOpen,
    title: 'Hướng dẫn sử dụng',
    description: 'Tài liệu hướng dẫn chi tiết về cách sử dụng các tính năng của nền tảng.',
    link: '/help#faq-section',
    linkText: 'Xem hướng dẫn',
    internal: true,
  },
  {
    icon: Video,
    title: 'Video hướng dẫn',
    description: 'Xem các video hướng dẫn trực quan để nắm bắt nhanh các tính năng.',
    link: 'https://www.youtube.com/@greetingcard',
    linkText: 'Xem video',
    external: true,
  },
  {
    icon: MessageCircle,
    title: 'Chat hỗ trợ',
    description: 'Liên hệ với đội ngũ hỗ trợ qua chat để được giải đáp nhanh chóng.',
    link: '/contact',
    linkText: 'Chat ngay',
    internal: true,
  },
  {
    icon: FileText,
    title: 'Điều khoản & Chính sách',
    description: 'Đọc các điều khoản sử dụng và chính sách bảo mật của chúng tôi.',
    link: '/terms',
    linkText: 'Xem tài liệu',
    internal: true,
  },
];

export function HelpResources() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Tài nguyên hữu ích
          </h2>
          <p className="text-muted-foreground text-lg">
            Khám phá các tài liệu, video và hướng dẫn để tận dụng tối đa nền tảng của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="hover:border-primary/50 border-2 transition-all hover:shadow-lg"
            >
              <CardContent className="px-6">
                <div className="bg-primary mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <resource.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">{resource.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {resource.description}
                </p>
                {resource.external ? (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline"
                  >
                    {resource.linkText} →
                  </a>
                ) : (
                  <Link
                    href={resource.link}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline"
                  >
                    {resource.linkText} →
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

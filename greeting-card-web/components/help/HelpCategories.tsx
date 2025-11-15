'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, HelpCircle, Package, Settings, ShoppingBag, Truck } from 'lucide-react';

const categories = [
  {
    icon: ShoppingBag,
    title: 'Mua sắm',
    description: 'Hướng dẫn tìm kiếm, chọn lựa và mua sản phẩm',
    count: 12,
    targetId: 'mua-sắm',
  },
  {
    icon: CreditCard,
    title: 'Thanh toán',
    description: 'Các phương thức thanh toán và xử lý giao dịch',
    count: 8,
    targetId: 'thanh-toán',
  },
  {
    icon: Truck,
    title: 'Giao hàng',
    description: 'Thông tin về vận chuyển và thời gian giao hàng',
    count: 10,
    targetId: 'giao-hàng',
  },
  {
    icon: Package,
    title: 'Đơn hàng',
    description: 'Theo dõi và quản lý đơn hàng của bạn',
    count: 6,
    targetId: 'đơn-hàng',
  },
  {
    icon: Settings,
    title: 'Tài khoản',
    description: 'Quản lý thông tin tài khoản và cài đặt',
    count: 9,
    targetId: 'tài-khoản',
  },
  {
    icon: HelpCircle,
    title: 'Câu hỏi khác',
    description: 'Các câu hỏi thường gặp khác',
    count: 15,
    targetId: 'faq-section',
  },
];

export function HelpCategories() {
  const handleClick = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Chủ đề trợ giúp
          </h2>
          <p className="text-muted-foreground text-lg">
            Chọn chủ đề bạn quan tâm để tìm câu trả lời nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleClick(category.targetId)}
              className="group text-left"
            >
              <Card className="hover:border-primary/50 h-full border-2 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="bg-primary mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                    <category.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <div className="text-primary text-sm font-medium">
                    {category.count} bài viết →
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

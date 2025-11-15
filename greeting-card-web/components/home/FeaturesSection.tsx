import { Heart, Share2, Shield, Zap } from 'lucide-react';

const features = [
  {
    name: 'Giao hàng nhanh chóng',
    description: 'Nhận thiệp ngay lập tức qua email hoặc SMS sau khi thanh toán.',
    icon: Zap,
  },
  {
    name: 'Chất lượng cao cấp',
    description: 'Thiệp được thiết kế bởi các họa sĩ hàng đầu với độ phân giải cao.',
    icon: Heart,
  },
  {
    name: 'Đa dạng chủ đề',
    description: 'Hàng ngàn mẫu thiệp cho mọi dịp: Sinh nhật, Cưới hỏi, Lễ tết...',
    icon: Share2,
  },
  {
    name: 'Thanh toán an toàn',
    description: 'Hỗ trợ nhiều phương thức thanh toán bảo mật và tiện lợi.',
    icon: Shield,
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Chúng tôi mang đến trải nghiệm tạo thiệp tốt nhất với những tính năng vượt trội.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(feature => (
            <div
              key={feature.name}
              className="bg-muted/50 hover:bg-primary/5 relative rounded-2xl p-8 transition-colors duration-300"
            >
              <div className="bg-primary mb-6 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                <feature.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-foreground mb-3 text-xl font-semibold">{feature.name}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

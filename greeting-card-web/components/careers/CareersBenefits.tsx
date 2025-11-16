import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Coffee, DollarSign, Heart, Laptop, Plane, Shield, Users } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'Lương thưởng cạnh tranh',
    description: 'Mức lương và thưởng hấp dẫn, đánh giá theo năng lực và đóng góp.',
  },
  {
    icon: Calendar,
    title: 'Làm việc linh hoạt',
    description: 'Giờ làm việc linh hoạt, work from home, và work-life balance được ưu tiên.',
  },
  {
    icon: Heart,
    title: 'Bảo hiểm đầy đủ',
    description: 'Bảo hiểm sức khỏe, bảo hiểm xã hội và các chế độ phúc lợi khác.',
  },
  {
    icon: Laptop,
    title: 'Thiết bị hiện đại',
    description: 'Được cung cấp laptop và các thiết bị làm việc hiện đại nhất.',
  },
  {
    icon: Plane,
    title: 'Nghỉ phép có lương',
    description: '12 ngày nghỉ phép có lương mỗi năm, tăng dần theo thâm niên.',
  },
  {
    icon: Coffee,
    title: 'Không gian làm việc',
    description: 'Văn phòng hiện đại, không gian sáng tạo và đồ uống miễn phí.',
  },
  {
    icon: Users,
    title: 'Phát triển nghề nghiệp',
    description: 'Đào tạo, workshop và cơ hội thăng tiến rõ ràng trong công ty.',
  },
  {
    icon: Shield,
    title: 'Môi trường an toàn',
    description: 'Môi trường làm việc an toàn, tôn trọng và hỗ trợ lẫn nhau.',
  },
];

export function CareersBenefits() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Lợi ích khi làm việc tại Greeting Card
          </h2>
          <p className="text-muted-foreground text-lg">
            Chúng tôi cam kết mang đến môi trường làm việc tốt nhất và những phúc lợi hấp dẫn cho
            nhân viên.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="hover:border-primary/50 border-2 transition-all hover:shadow-lg"
            >
              <CardContent className="p-6 text-center">
                <div className="bg-primary mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <benefit.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

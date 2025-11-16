import { Card, CardContent } from '@/components/ui/card';
import { Award, Lightbulb, Target, Users } from 'lucide-react';

const cultureValues = [
  {
    icon: Target,
    title: 'Định hướng rõ ràng',
    description:
      'Chúng tôi có tầm nhìn và mục tiêu rõ ràng, giúp mọi thành viên hiểu được đóng góp của mình vào thành công chung.',
  },
  {
    icon: Lightbulb,
    title: 'Đổi mới sáng tạo',
    description:
      'Khuyến khích tư duy sáng tạo, thử nghiệm ý tưởng mới và không ngại thất bại để học hỏi.',
  },
  {
    icon: Users,
    title: 'Làm việc nhóm',
    description:
      'Tôn trọng, hỗ trợ lẫn nhau và cùng nhau xây dựng một môi trường làm việc tích cực.',
  },
  {
    icon: Award,
    title: 'Phát triển cá nhân',
    description:
      'Đầu tư vào phát triển kỹ năng và sự nghiệp của từng thành viên thông qua đào tạo và mentoring.',
  },
];

export function CareersCulture() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Văn hóa công ty
          </h2>
          <p className="text-muted-foreground text-lg">
            Những giá trị và nguyên tắc định hướng cách chúng tôi làm việc và phát triển.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {cultureValues.map((value, index) => (
            <Card
              key={index}
              className="hover:border-primary/50 border-2 transition-all hover:shadow-lg"
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

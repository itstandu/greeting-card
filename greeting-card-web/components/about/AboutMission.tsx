import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, Users } from 'lucide-react';

const missionItems = [
  {
    icon: Heart,
    title: 'Sứ mệnh',
    description:
      'Mang đến những tấm thiệp chúc mừng đẹp mắt, ý nghĩa, giúp mọi người dễ dàng trao gửi tình cảm và lời chúc tốt đẹp đến người thân yêu.',
  },
  {
    icon: Target,
    title: 'Tầm nhìn',
    description:
      'Trở thành nền tảng thiệp chúc mừng trực tuyến hàng đầu tại Việt Nam, nơi mọi người có thể tìm thấy và tạo ra những tấm thiệp hoàn hảo cho mọi dịp đặc biệt.',
  },
  {
    icon: Users,
    title: 'Giá trị cốt lõi',
    description:
      'Chúng tôi đặt khách hàng làm trung tâm, luôn nỗ lực cải thiện chất lượng sản phẩm và dịch vụ để mang đến trải nghiệm tốt nhất.',
  },
];

export function AboutMission() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Sứ mệnh, Tầm nhìn & Giá trị
          </h2>
          <p className="text-muted-foreground text-lg">
            Những điều chúng tôi tin tưởng và hướng tới trong hành trình phục vụ khách hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {missionItems.map((item, index) => (
            <Card
              key={index}
              className="hover:border-primary/50 border-2 transition-all hover:shadow-lg"
            >
              <CardContent className="px-8">
                <div className="bg-primary mb-6 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <item.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-foreground mb-4 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

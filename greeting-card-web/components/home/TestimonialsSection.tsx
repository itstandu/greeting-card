import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content: 'Tôi chưa bao giờ nghĩ việc tạo thiệp lại dễ dàng đến thế. Mẫu mã rất đẹp và đa dạng!',
    author: 'Nguyễn Văn A',
    role: 'Designer',
  },
  {
    content: 'Rất thích tính năng gửi thiệp qua email. Bạn bè tôi đều bất ngờ khi nhận được.',
    author: 'Trần Thị B',
    role: 'Marketing Manager',
  },
  {
    content: 'Dịch vụ tuyệt vời, hỗ trợ nhiệt tình. Chắc chắn sẽ giới thiệu cho mọi người.',
    author: 'Lê Văn C',
    role: 'Freelancer',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Sự hài lòng của bạn là động lực để chúng tôi phát triển mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-card-foreground mb-6 italic">&quot;{testimonial.content}&quot;</p>
              <div className="flex items-center gap-4">
                <Avatar className="size-11">
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground font-semibold">{testimonial.author}</p>
                  <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

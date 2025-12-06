import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content:
      'Mình đã mua thiệp sinh nhật cho bạn thân, chất lượng in ấn rất tốt và giao hàng đúng hẹn. Bạn mình rất thích!',
    author: 'Minh Anh',
    role: 'Sinh viên',
  },
  {
    content:
      'Công ty mình đặt 50 thiệp chúc mừng năm mới cho khách hàng. Giá cả hợp lý, thiết kế chuyên nghiệp và giao hàng nhanh. Sẽ đặt lại!',
    author: 'Hoàng Nam',
    role: 'Nhân viên Marketing',
  },
  {
    content:
      'Tạo thiệp cảm ơn online rất tiện lợi, không cần ra ngoài mua. Mẫu mã đẹp, dễ chỉnh sửa và gửi ngay được qua email.',
    author: 'Lan Hương',
    role: 'Giáo viên',
  },
  {
    content:
      'Thiệp kỷ niệm ngày cưới của mình rất đẹp, giấy dày và màu sắc sống động. Chồng mình rất xúc động khi nhận được.',
    author: 'Thảo Vy',
    role: 'Nhân viên văn phòng',
  },
  {
    content:
      'Đặt thiệp chúc mừng tốt nghiệp cho em trai. Nhân viên tư vấn nhiệt tình, giúp mình chọn được mẫu phù hợp. Cảm ơn shop!',
    author: 'Đức Anh',
    role: 'Kỹ sư',
  },
  {
    content:
      'Mình hay đặt thiệp ở đây vì có nhiều mẫu độc đáo, không bị trùng với các shop khác. Giá cũng rẻ hơn so với mặt bằng chung.',
    author: 'Ngọc Trâm',
    role: 'Chủ shop online',
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

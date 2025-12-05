import { Card, CardContent } from '@/components/ui/card';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants/contact';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Gửi email cho chúng tôi bất cứ lúc nào',
    value: CONTACT_INFO.supportEmail,
    link: `mailto:${CONTACT_INFO.supportEmail}`,
    action: 'Gửi email',
  },
  {
    icon: Phone,
    title: 'Điện thoại',
    description: 'Gọi cho chúng tôi trong giờ làm việc',
    value: CONTACT_INFO.phone,
    link: CONTACT_INFO.phoneLink,
    action: 'Gọi ngay',
  },
  {
    icon: MapPin,
    title: 'Văn phòng',
    description: 'Đến thăm văn phòng của chúng tôi',
    value: CONTACT_INFO.address.full,
    link: CONTACT_INFO.address.googleMapsUrl,
    action: 'Xem bản đồ',
  },
  {
    icon: Clock,
    title: 'Giờ làm việc',
    description: 'Thời gian chúng tôi có mặt',
    value: CONTACT_INFO.workingHours,
    link: '#',
    action: null,
  },
];

export function ContactInfo() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Thông tin liên hệ
          </h2>
          <p className="text-muted-foreground text-lg">Chọn phương thức liên hệ phù hợp với bạn.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className="hover:border-primary/50 border-2 transition-all hover:shadow-lg"
            >
              <CardContent className="p-6 text-center">
                <div className="bg-primary mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <method.icon className="text-primary-foreground h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">{method.title}</h3>
                <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                  {method.description}
                </p>
                <p className="text-foreground mb-4 text-sm font-medium">{method.value}</p>
                {method.action && (
                  <a
                    href={method.link}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline"
                  >
                    {method.action} →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

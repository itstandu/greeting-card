import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Phone } from 'lucide-react';

export function ContactMap() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Tìm đường đến văn phòng
          </h2>
          <p className="text-muted-foreground text-lg">
            Đến thăm văn phòng của chúng tôi tại TP. Hồ Chí Minh.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border-2">
            <CardContent className="p-0">
              {/* Google Maps Embed - Landmark 81, TP.HCM */}
              <div className="relative aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.126124868823!2d106.72144807480642!3d10.794820458974688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c2f8f30517%3A0x46225f8ee1a8e914!2sLandmark%2081!5e0!3m2!1svi!2s!4v1701619200000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title="Vị trí văn phòng Greeting Card"
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-primary mx-auto mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <MapPin className="text-primary-foreground h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">Địa chỉ</h3>
                <p className="text-muted-foreground text-sm">
                  Tầng 15, Landmark 81
                  <br />
                  720A Điện Biên Phủ, Phường 22
                  <br />
                  Quận Bình Thạnh, TP. Hồ Chí Minh
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-primary mx-auto mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <Clock className="text-primary-foreground h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">Giờ mở cửa</h3>
                <p className="text-muted-foreground text-sm">
                  Thứ 2 - Thứ 6: 8:30 - 17:30
                  <br />
                  Thứ 7: 9:00 - 12:00
                  <br />
                  Chủ nhật: Nghỉ
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-primary mx-auto mb-4 inline-flex items-center justify-center rounded-xl p-3 shadow-lg">
                  <Phone className="text-primary-foreground h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">Điện thoại</h3>
                <p className="text-muted-foreground text-sm">
                  <a
                    href="tel:19001234"
                    className="text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    1900 1234
                  </a>
                  <br />
                  <a
                    href="tel:02838221234"
                    className="text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    028 3822 1234
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

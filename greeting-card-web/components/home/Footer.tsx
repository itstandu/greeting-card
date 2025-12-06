import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/constants/contact';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-border bg-muted text-muted-foreground border-t py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Description */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="text-foreground mb-4 block text-2xl font-bold">
              GreetingCard
            </Link>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Nền tảng tạo và gửi thiệp điện tử hàng đầu Việt Nam. Kết nối yêu thương, chia sẻ
              khoảnh khắc đặc biệt với những tấm thiệp ý nghĩa.
            </p>
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{CONTACT_INFO.address.short}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href={CONTACT_INFO.phoneLink}
                  className="hover:text-foreground transition-colors"
                >
                  {CONTACT_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${CONTACT_INFO.supportEmail}`}
                  className="hover:text-foreground transition-colors"
                >
                  {CONTACT_INFO.supportEmail}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <a
                href={CONTACT_INFO.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={CONTACT_INFO.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={CONTACT_INFO.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={CONTACT_INFO.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Danh mục thiệp
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=newest"
                  className="hover:text-foreground transition-colors"
                >
                  Thiệp mới nhất
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=bestseller"
                  className="hover:text-foreground transition-colors"
                >
                  Bán chạy nhất
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">Công ty</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/help#giao-hàng" className="hover:text-foreground transition-colors">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/help#thanh-toán" className="hover:text-foreground transition-colors">
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border text-muted-foreground flex flex-col items-center justify-between gap-4 border-t pt-8 text-center text-sm md:flex-row">
          <p>&copy; {new Date().getFullYear()} GreetingCard. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

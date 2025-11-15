import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Sinh nhật',
    image: '/categories/birthday.jpg', // Placeholder path
    color: 'bg-pink-100',
    textColor: 'text-pink-600',
  },
  {
    name: 'Đám cưới',
    image: '/categories/wedding.jpg', // Placeholder path
    color: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    name: 'Cảm ơn',
    image: '/categories/thankyou.jpg', // Placeholder path
    color: 'bg-green-100',
    textColor: 'text-green-600',
  },
  {
    name: 'Tình yêu',
    image: '/categories/love.jpg', // Placeholder path
    color: 'bg-red-100',
    textColor: 'text-red-600',
  },
];

export function GallerySection() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Khám phá kho mẫu đa dạng
            </h2>
            <p className="text-muted-foreground text-lg">
              Hàng trăm mẫu thiệp được thiết kế chuyên nghiệp cho mọi dịp đặc biệt trong năm.
            </p>
          </div>
          <Button asChild variant="ghost" className="group">
            <Link href="/gallery" className="text-primary flex items-center font-semibold">
              Xem tất cả{' '}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(category => (
            <Link
              key={category.name}
              href={`/gallery?category=${category.name}`}
              className="group bg-muted relative block aspect-[3/4] overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl"
            >
              {/* Placeholder for category image - using color block */}
              <div
                className={`absolute inset-0 ${category.color} opacity-50 transition-opacity group-hover:opacity-70`}
              />

              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3
                  className={`text-2xl font-bold ${category.textColor} translate-y-0 transition-transform duration-300 group-hover:-translate-y-2`}
                >
                  {category.name}
                </h3>
                <span className="text-foreground flex translate-y-4 transform items-center font-medium opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Xem mẫu <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

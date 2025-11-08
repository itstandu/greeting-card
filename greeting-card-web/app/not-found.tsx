'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Animated 404 */}
        <div className="mb-8">
          <h1 className="text-primary mb-4 text-9xl font-extrabold tracking-tight sm:text-[12rem]">
            404
          </h1>
          <div className="relative inline-block">
            <div className="bg-primary/20 absolute -inset-4 rounded-full blur-2xl" />
            <div className="relative">
              <Heart className="text-primary mx-auto h-16 w-16 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Trang không tìm thấy
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md text-lg">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy quay lại trang
            chủ hoặc tìm kiếm sản phẩm bạn muốn.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="bg-primary/10 absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute right-1/4 bottom-1/4 -z-10 h-64 w-64 rounded-full blur-3xl" />

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-lg shadow-lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8 text-lg">
            <Link href="/products">
              <Search className="mr-2 h-5 w-5" />
              Tìm sản phẩm
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 rounded-full px-8 text-lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Quay lại
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="border-border mt-12 border-t pt-8">
          <p className="text-muted-foreground mb-4 text-sm font-medium">Có thể bạn đang tìm:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
            >
              Sản phẩm
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/categories"
              className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
            >
              Danh mục
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/about"
              className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
            >
              Về chúng tôi
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/wishlist"
              className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
            >
              Yêu thích
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

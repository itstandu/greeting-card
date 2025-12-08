'use client';

import Link from 'next/link';
import { ProductReviews } from '@/components/products/ProductReviews';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product, ProductReview, ProductReviewStats } from '@/types';
import {
  BadgeCheck,
  Box,
  Calendar,
  ClipboardCheck,
  Package,
  ShieldCheck,
  Star,
  Tag,
  ThumbsUp,
  Truck,
  TruckIcon,
} from 'lucide-react';

interface ProductDetailsTabsProps {
  product: Product;
  reviews: ProductReview[];
  reviewStats?: ProductReviewStats;
  canReview: boolean;
  isAuthenticated: boolean;
  loadingCanReview: boolean;
  loadingReviews: boolean;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
}

export function ProductDetailsTabs({
  product,
  reviews,
  reviewStats,
  canReview,
  isAuthenticated,
  loadingCanReview,
  onSubmitReview,
}: ProductDetailsTabsProps) {
  const formattedDate = new Date(product.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description" className="gap-2">
          <ClipboardCheck className="hidden h-4 w-4 sm:block" />
          Mô tả chi tiết
        </TabsTrigger>
        <TabsTrigger value="shipping" className="gap-2">
          <Truck className="hidden h-4 w-4 sm:block" />
          Vận chuyển
        </TabsTrigger>
        <TabsTrigger value="reviews" className="gap-2">
          <Star className="hidden h-4 w-4 sm:block" />
          Đánh giá ({reviewStats?.totalReviews || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-6 pt-6">
        {/* Product Description */}
        <div className="prose prose-sm max-w-none">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Box className="text-primary h-5 w-5" />
            Thông tin sản phẩm
          </h3>
          <p className="text-muted-foreground mt-3 leading-relaxed">{product.description}</p>
        </div>

        <Separator />

        {/* Product Details Table */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Tag className="text-primary h-5 w-5" />
            Chi tiết sản phẩm
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-muted/50 flex justify-between rounded-lg p-3">
              <span className="text-muted-foreground">Mã sản phẩm (SKU)</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            <div className="bg-muted/50 flex justify-between rounded-lg p-3">
              <span className="text-muted-foreground">Danh mục</span>
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-primary font-medium hover:underline"
              >
                {product.category.name}
              </Link>
            </div>
            <div className="bg-muted/50 flex justify-between rounded-lg p-3">
              <span className="text-muted-foreground">Tình trạng</span>
              <Badge
                variant="outline"
                className={
                  product.stock > 0
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }
              >
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </Badge>
            </div>
            <div className="bg-muted/50 flex justify-between rounded-lg p-3">
              <span className="text-muted-foreground">Ngày đăng</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-4">
              <span className="text-muted-foreground mr-2 text-sm">Tags:</span>
              <div className="inline-flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <Separator />
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <BadgeCheck className="text-primary h-5 w-5" />
            Đặc điểm nổi bật
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <ThumbsUp className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Thiết kế độc đáo, sang trọng</span>
            </li>
            <li className="flex items-start gap-3">
              <ThumbsUp className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Chất liệu cao cấp, bền đẹp</span>
            </li>
            <li className="flex items-start gap-3">
              <ThumbsUp className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Phù hợp làm quà tặng mọi dịp</span>
            </li>
            <li className="flex items-start gap-3">
              <ThumbsUp className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Đóng gói cẩn thận, chuyên nghiệp</span>
            </li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="space-y-6 pt-6">
        {/* Shipping Features */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-2 border-dashed">
            <CardContent className="p-4 text-center">
              <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <TruckIcon className="text-primary h-6 w-6" />
              </div>
              <h4 className="font-semibold">Giao hàng nhanh</h4>
              <p className="text-muted-foreground mt-1 text-sm">2-3 ngày làm việc toàn quốc</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-dashed">
            <CardContent className="p-4 text-center">
              <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Package className="text-primary h-6 w-6" />
              </div>
              <h4 className="font-semibold">Đóng gói cẩn thận</h4>
              <p className="text-muted-foreground mt-1 text-sm">Bao bì đẹp mắt, chuyên nghiệp</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-dashed">
            <CardContent className="p-4 text-center">
              <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <ShieldCheck className="text-primary h-6 w-6" />
              </div>
              <h4 className="font-semibold">Đảm bảo chất lượng</h4>
              <p className="text-muted-foreground mt-1 text-sm">Đổi trả miễn phí trong 7 ngày</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Shipping Policy */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Chính sách vận chuyển</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Giao hàng toàn quốc qua các đơn vị uy tín</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Thời gian giao hàng: 2-5 ngày làm việc</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Kiểm tra hàng trước khi thanh toán (COD)</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Chính sách đổi trả</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Đổi trả miễn phí trong 7 ngày nếu có lỗi từ nhà sản xuất</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Sản phẩm phải còn nguyên tem, nhãn mác</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Hoàn tiền nhanh chóng trong 3-5 ngày làm việc</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Hỗ trợ tư vấn 24/7 qua hotline</span>
              </li>
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          stats={reviewStats}
          canReview={canReview}
          isAuthenticated={isAuthenticated}
          loadingCanReview={loadingCanReview}
          onSubmitReview={onSubmitReview}
        />
      </TabsContent>
    </Tabs>
  );
}

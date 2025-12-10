'use client';

import {
  ProductDetailsTabs,
  ProductHighlights,
  ProductImageGallery,
  ProductInfoClient,
  RelatedProducts,
} from '@/components/products';
import { Card, CardContent } from '@/components/ui/card';
import { PromoBanner, TrustBadges } from '@/components/ui/decorative-elements';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useProductReviews } from '@/hooks/use-product-reviews';
import { Product } from '@/types';
import { Percent } from 'lucide-react';

interface ProductDetailClientProps {
  product: Product | null;
  relatedProducts: Product[];
  loading?: boolean;
  error?: boolean;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  loading = false,
  error = false,
}: ProductDetailClientProps) {
  const { isAuthenticated } = useAuth();
  const { reviews, reviewStats, canReview, loadingReviews, loadingCanReview, submitReview } =
    useProductReviews({
      productId: product?.id,
      isAuthenticated,
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <Skeleton className="h-[600px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-semibold">Không tìm thấy sản phẩm</h2>
            <p className="text-muted-foreground">Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Danh mục', href: '/categories' },
    { label: product.category.name, href: `/categories/${product.category.slug}` },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header with Breadcrumb */}
      <div className="border-b bg-white">
        <PageHeader title="" breadcrumbs={breadcrumbs} variant="compact" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="px-4 lg:px-6">
                <ProductImageGallery
                  images={product.images}
                  productName={product.name}
                  isOutOfStock={product.stock === 0}
                />
              </CardContent>
            </Card>

            {/* Product Highlights - Desktop */}
            <ProductHighlights variant="desktop" />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="px-6">
                <ProductInfoClient product={product} />
              </CardContent>
            </Card>

            {/* Product Highlights - Mobile */}
            <ProductHighlights variant="mobile" />

            {/* Promo Banner */}
            <PromoBanner
              title="Ưu đãi đặc biệt!"
              description="Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Áp dụng đến hết tháng."
              variant="gradient"
              icon={Percent}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-8">
          <CardContent className="px-6 lg:px-8">
            <ProductDetailsTabs
              product={product}
              reviews={reviews}
              reviewStats={reviewStats || undefined}
              canReview={canReview}
              isAuthenticated={isAuthenticated}
              loadingCanReview={loadingCanReview}
              loadingReviews={loadingReviews}
              onSubmitReview={submitReview}
            />
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mb-8">
          <TrustBadges />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card>
            <CardContent className="px-6 lg:px-8">
              <RelatedProducts products={relatedProducts} currentProductId={product.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

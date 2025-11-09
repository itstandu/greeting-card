'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ProductImageGallery,
  ProductInfoClient,
  ProductReviews,
  RelatedProducts,
} from '@/components/product';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PromoBanner, TrustBadges } from '@/components/ui/decorative-elements';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import {
  canUserReviewProduct,
  createProductReview,
  getProductReviews,
  getProductReviewStats,
} from '@/services/review.service';
import { Product, ProductReview, ProductReviewStats } from '@/types';
import {
  Award,
  BadgeCheck,
  Box,
  Calendar,
  ClipboardCheck,
  Gift,
  Package,
  Percent,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Star,
  Tag,
  ThumbsUp,
  Truck,
  TruckIcon,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product | null;
  relatedProducts: Product[];
  loading?: boolean;
  error?: boolean;
}

const productHighlights = [
  { icon: Award, text: 'Chất lượng cao cấp', color: 'text-amber-600' },
  { icon: Gift, text: 'Đóng gói đẹp mắt', color: 'text-pink-600' },
  { icon: RefreshCcw, text: 'Đổi trả dễ dàng', color: 'text-blue-600' },
  { icon: Shield, text: 'Bảo hành chính hãng', color: 'text-green-600' },
];

export function ProductDetailClient({
  product,
  relatedProducts,
  loading = false,
  error = false,
}: ProductDetailClientProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [loadingCanReview, setLoadingCanReview] = useState(true);

  // Fetch reviews and stats from API
  useEffect(() => {
    if (!product?.id) return;

    const fetchReviewData = async () => {
      try {
        setLoadingReviews(true);
        const [reviewsRes, statsRes] = await Promise.all([
          getProductReviews(product.id),
          getProductReviewStats(product.id),
        ]);
        setReviews(reviewsRes.data || []);
        setReviewStats(statsRes.data || null);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviewData();
  }, [product?.id]);

  // Check if user can review product (only if authenticated)
  useEffect(() => {
    if (!product?.id || !isAuthenticated) {
      setCanReview(false);
      setLoadingCanReview(false);
      return;
    }

    const checkCanReview = async () => {
      try {
        setLoadingCanReview(true);
        const response = await canUserReviewProduct(product.id);
        setCanReview(response.data || false);
      } catch (error) {
        // If error (e.g., not authenticated), user cannot review
        setCanReview(false);
      } finally {
        setLoadingCanReview(false);
      }
    };

    checkCanReview();
  }, [product?.id, isAuthenticated]);

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

  const formattedDate = new Date(product.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate satisfaction percentage from real data
  const satisfactionPercent = reviewStats
    ? Math.round(
        (((reviewStats.ratingDistribution[4] || 0) + (reviewStats.ratingDistribution[5] || 0)) /
          (reviewStats.totalReviews || 1)) *
          100,
      )
    : 0;

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
              <CardContent className="p-4 lg:p-6">
                <ProductImageGallery
                  images={product.images}
                  productName={product.name}
                  isOutOfStock={product.stock === 0}
                />
              </CardContent>
            </Card>

            {/* Product Highlights - Desktop */}
            <div className="hidden grid-cols-2 gap-3 lg:grid">
              {productHighlights.map((highlight, index) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="flex items-center gap-3 p-3">
                    <highlight.icon className={`h-5 w-5 ${highlight.color}`} />
                    <span className="text-sm font-medium">{highlight.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Quick Stats - Real data */}
            {reviewStats && (
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>
                    {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} đánh giá)
                  </span>
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <ProductInfoClient product={product} />
              </CardContent>
            </Card>

            {/* Product Highlights - Mobile */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {productHighlights.map((highlight, index) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="flex items-center gap-3 p-3">
                    <highlight.icon className={`h-5 w-5 ${highlight.color}`} />
                    <span className="text-sm font-medium">{highlight.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

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
          <CardContent className="p-6 lg:p-8">
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
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {product.description}
                  </p>
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
                      <p className="text-muted-foreground mt-1 text-sm">
                        2-3 ngày làm việc toàn quốc
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                        <Package className="text-primary h-6 w-6" />
                      </div>
                      <h4 className="font-semibold">Đóng gói cẩn thận</h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Bao bì đẹp mắt, chuyên nghiệp
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                        <ShieldCheck className="text-primary h-6 w-6" />
                      </div>
                      <h4 className="font-semibold">Đảm bảo chất lượng</h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Đổi trả miễn phí trong 7 ngày
                      </p>
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
                {/* Review Summary - Real data */}
                {loadingReviews ? (
                  <div className="bg-muted/50 mb-6 flex flex-col items-center gap-4 rounded-lg p-6 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ) : null}

                <ProductReviews
                  productId={product.id}
                  reviews={reviews}
                  stats={reviewStats || undefined}
                  canReview={canReview}
                  isAuthenticated={isAuthenticated}
                  onSubmitReview={async (rating, comment) => {
                    await createProductReview(product.id, { rating, comment });
                    // Refresh reviews after submission
                    const [reviewsRes, statsRes] = await Promise.all([
                      getProductReviews(product.id),
                      getProductReviewStats(product.id),
                    ]);
                    setReviews(reviewsRes.data || []);
                    setReviewStats(statsRes.data || null);
                    setCanReview(false); // User has reviewed, can't review again
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mb-8">
          <TrustBadges />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card>
            <CardContent className="p-6 lg:p-8">
              <RelatedProducts products={relatedProducts} currentProductId={product.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { getProducts } from '@/services/product.service';
import type { Product } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await getProducts(
          {
            isFeatured: true,
            size: 4,
            isActive: true,
          },
          isAuthenticated,
        );
        if (response.data) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch featured products', error);
        // Don't show toast on homepage load error to avoid annoyance
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [isAuthenticated]);

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Không thể thêm vào giỏ hàng', {
        description: 'Sản phẩm đã hết hàng',
      });
      return;
    }

    // User đã đăng nhập: Gọi API
    if (isAuthenticated && user) {
      try {
        const { addToCart } = await import('@/services/cart.service');
        await addToCart({ productId: product.id, quantity: 1 });

        // Dispatch event để header fetch lại từ API
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-changed'));
        }

        toast.success('Đã thêm vào giỏ hàng', {
          description: product.name,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
        toast.error('Không thể thêm vào giỏ hàng', {
          description: message,
        });
      }
      return;
    }

    // Guest: Thêm vào localStorage
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

    cartStorage.addItem(
      {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: primaryImage?.imageUrl || '',
        price: Number(product.price),
        stock: product.stock,
      },
      1,
    );

    toast.success('Đã thêm vào giỏ hàng', {
      description: product.name,
    });
  };

  if (loading) {
    return (
      <section className="bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-foreground mb-4 flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <Sparkles className="h-8 w-8 text-amber-500" />
              Sản phẩm nổi bật
            </h2>
            <p className="text-muted-foreground text-lg">
              Những mẫu thiệp được yêu thích nhất, sẵn sàng để bạn gửi đi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} variant="featured" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Hide section if no featured products
  }

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="text-foreground mb-4 flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <Sparkles className="h-8 w-8 text-amber-500" />
              Sản phẩm nổi bật
            </h2>
            <p className="text-muted-foreground text-lg">
              Những mẫu thiệp được yêu thích nhất, sẵn sàng để bạn gửi đi.
            </p>
          </div>
          <Button asChild variant="ghost" className="group">
            <Link href="/products" className="text-primary flex items-center font-semibold">
              Xem tất cả sản phẩm{' '}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              variant="featured"
              showAddToCart
              showAddToWishlist
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

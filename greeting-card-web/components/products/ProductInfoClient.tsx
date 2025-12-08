'use client';

import { ProductInfo } from '@/components/products';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { addToCart } from '@/services/cart.service';
import { Product } from '@/types';

interface ProductInfoClientProps {
  product: Product;
}

export function ProductInfoClient({ product }: ProductInfoClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = async (productId: number, quantity: number) => {
    // Lấy thông tin sản phẩm để thêm vào localStorage
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

    // Guest: Thêm vào localStorage
    if (!user) {
      try {
        cartStorage.addItem(
          {
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: primaryImage?.imageUrl || '',
            price: Number(product.price),
            stock: product.stock,
          },
          quantity,
        );

        toast({
          title: 'Thành công',
          description: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ hàng';
        toast({
          title: 'Lỗi',
          description: message,
          variant: 'destructive',
        });
        throw error;
      }
      return;
    }

    // User đã đăng nhập: Gọi API (lưu vào session trên server)
    try {
      await addToCart({ productId, quantity });

      // Dispatch event để header fetch lại từ API
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-changed'));
      }

      toast({
        title: 'Thành công',
        description: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ hàng';
      toast({
        title: 'Lỗi',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return <ProductInfo product={product} onAddToCart={handleAddToCart} />;
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { Minus, Plus, Share2, ShoppingCart } from 'lucide-react';

interface ProductInfoProps {
  product: Product;
  onAddToCart?: (productId: number, quantity: number) => Promise<void>;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!onAddToCart) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id, quantity);
      toast({
        title: 'Thành công',
        description: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm sản phẩm vào giỏ hàng',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Đã sao chép',
        description: 'Đã sao chép link sản phẩm vào clipboard',
      });
    }
  };

  const isAvailable = product.isActive && product.stock > 0;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {product.category && (
            <Badge variant="secondary" asChild>
              <Link href={`/categories/${product.category.slug}`} className="hover:underline">
                {product.category.name}
              </Link>
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
              Nổi bật
            </Badge>
          )}
          {!product.isActive && <Badge variant="destructive">Ngừng kinh doanh</Badge>}
          {product.stock > 0 && product.isActive ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600">
              Còn hàng
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
              Hết hàng
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
        <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
          <span>SKU: {product.sku}</span>
          {product.stock > 0 && product.stock <= 10 && (
            <span className="font-medium text-orange-600">Chỉ còn {product.stock} sản phẩm</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="text-primary text-4xl font-bold">{formatCurrency(product.price)}</span>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <h3 className="mb-2 text-lg font-semibold">Mô tả sản phẩm</h3>
        <div className="prose prose-sm text-muted-foreground max-w-none">
          <p>{product.description}</p>
        </div>
      </div>

      {/* Quantity Selector */}
      {isAvailable && (
        <div>
          <label className="mb-2 block text-sm font-medium">Số lượng</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 w-16 items-center justify-center text-base font-semibold">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-muted-foreground text-sm">{product.stock} sản phẩm có sẵn</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          size="lg"
          className="flex-1 gap-2"
          onClick={handleAddToCart}
          disabled={!isAvailable || isAddingToCart}
          loading={isAddingToCart}
        >
          <ShoppingCart className="h-5 w-5" />
          {isAvailable ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
        </Button>
        <WishlistButton
          product={product}
          size="lg"
          variant="outline"
          showText={true}
          className="gap-2"
        />
        <Button size="lg" variant="outline" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-2 text-sm font-medium">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag.id} variant="outline" className="text-sm">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Additional Info */}
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Danh mục:</span>
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-primary font-medium hover:underline"
          >
            {product.category.name}
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tồn kho:</span>
          <span className="font-medium">
            {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
          </span>
        </div>
      </div>
    </div>
  );
}

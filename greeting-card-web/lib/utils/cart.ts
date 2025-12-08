import type { Cart, CartResponse } from '@/types';

export function getProductImage(
  product: CartResponse['items'][number]['product'],
): string {
  // Prefer primary image; fall back to the first image; default to empty string.
  if (product.images && product.images.length > 0) {
    const primary = product.images.find(img => img.isPrimary);
    const selected = primary ?? product.images[0];
    if (selected?.imageUrl) {
      return selected.imageUrl;
    }
  }

  return product.imageUrl ?? '';
}

export function mapCartResponseToCart(cartResponse: CartResponse): Cart {
  return {
    items: cartResponse.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: getProductImage(item.product),
      price: Number(item.product.price),
      quantity: item.quantity,
      stock: item.product.stock,
    })),
    total: Number(cartResponse.total),
    totalItems: cartResponse.totalItems,
  };
}


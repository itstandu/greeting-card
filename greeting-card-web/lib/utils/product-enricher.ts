import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import type { Product } from '@/types';

/**
 * Enrich products with wishlist status from localStorage for guest users.
 * For authenticated users, the server already provides inWishlist status.
 *
 * @param products Array of products to enrich
 * @param isAuthenticated Whether the user is authenticated
 * @returns Array of products with enriched wishlist status
 */
export function enrichProductsWithWishlistStatus(
  products: Product[],
  isAuthenticated: boolean,
): Product[] {
  // If user is authenticated, server already provides inWishlist status
  // No need to enrich from localStorage
  if (isAuthenticated) {
    return products;
  }

  // For guest users, check localStorage and set inWishlist status
  return products.map(product => ({
    ...product,
    inWishlist: wishlistStorage.hasItem(product.id),
  }));
}

import { wishlistStorage } from '../store/wishlist/wishlist-storage';
import { syncWishlist } from '@/services';
import type { SyncWishlistRequest } from '@/types';

// Sync wishlist từ localStorage lên server sau khi login (trả về true nếu sync thành công)
export async function syncWishlistAfterLogin(): Promise<boolean> {
  try {
    // Lấy wishlist từ localStorage
    const localWishlist = wishlistStorage.getWishlist();

    // Kiểm tra có items không
    if (!localWishlist.items || localWishlist.items.length === 0) {
      return false; // Không có gì để sync
    }

    // Chuẩn bị request
    const syncRequest: SyncWishlistRequest = {
      productIds: localWishlist.items.map(item => ({
        productId: item.productId,
      })),
    };

    // Gọi API sync
    await syncWishlist(syncRequest);

    // Xóa wishlist từ localStorage sau khi sync thành công
    wishlistStorage.clearWishlist();

    return true;
  } catch (error) {
    console.error('Error syncing wishlist after login:', error);
    // Không throw error để không ảnh hưởng đến login flow
    // User vẫn login thành công, chỉ là wishlist không sync được
    return false;
  }
}

// Kiểm tra xem có wishlist trong localStorage không
export function hasLocalWishlist(): boolean {
  return !wishlistStorage.isEmpty();
}

// Lấy số lượng items trong localStorage wishlist
export function getLocalWishlistItemCount(): number {
  return wishlistStorage.getItemCount();
}

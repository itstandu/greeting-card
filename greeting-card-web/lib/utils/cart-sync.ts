import { cartStorage } from '../store/cart/cart-storage';
import { syncCart } from '@/services';
import type { SyncCartRequest } from '@/types';

// Sync cart từ localStorage lên server sau khi login (trả về true nếu sync thành công)
export async function syncCartAfterLogin(): Promise<boolean> {
  try {
    // Lấy cart từ localStorage
    const localCart = cartStorage.getCart();

    // Kiểm tra có items không
    if (!localCart.items || localCart.items.length === 0) {
      return false; // Không có gì để sync
    }

    // Chuẩn bị request
    const syncRequest: SyncCartRequest = {
      items: localCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    // Gọi API sync
    await syncCart(syncRequest);

    // Xóa cart từ localStorage sau khi sync thành công
    cartStorage.clearCart();

    return true;
  } catch (error) {
    console.error('Error syncing cart after login:', error);
    // Không throw error để không ảnh hưởng đến login flow
    // User vẫn login thành công, chỉ là cart không sync được
    return false;
  }
}

// Kiểm tra xem có cart trong localStorage không
export function hasLocalCart(): boolean {
  return !cartStorage.isEmpty();
}

// Lấy số lượng items trong localStorage cart
export function getLocalCartItemCount(): number {
  return cartStorage.getItemCount();
}

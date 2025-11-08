import { Wishlist, WishlistItem } from '@/types';

const WISHLIST_STORAGE_KEY = 'greeting_card_wishlist';

export const wishlistStorage = {
  // Lấy wishlist từ localStorage
  getWishlist(): Wishlist {
    if (typeof window === 'undefined') {
      return { items: [], totalItems: 0 };
    }

    try {
      const wishlistData = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!wishlistData) {
        return { items: [], totalItems: 0 };
      }

      const wishlist: Wishlist = JSON.parse(wishlistData);
      return wishlist;
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
      return { items: [], totalItems: 0 };
    }
  },

  // Lưu wishlist vào localStorage
  saveWishlist(wishlist: Wishlist): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  },

  // Thêm sản phẩm vào wishlist
  addItem(item: Omit<WishlistItem, 'addedAt'>): Wishlist {
    const wishlist = this.getWishlist();

    // Kiểm tra sản phẩm đã tồn tại chưa
    const existingItem = wishlist.items.find(i => i.productId === item.productId);

    if (existingItem) {
      // Sản phẩm đã có trong wishlist, không thêm nữa
      return wishlist;
    }

    // Thêm sản phẩm mới với addedAt
    wishlist.items.push({
      ...item,
      addedAt: new Date().toISOString(),
    });

    wishlist.totalItems = wishlist.items.length;

    this.saveWishlist(wishlist);

    // Dispatch event để header cập nhật số lượng
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist-changed'));
    }

    return wishlist;
  },

  // Xóa sản phẩm khỏi wishlist
  removeItem(productId: number): Wishlist {
    const wishlist = this.getWishlist();

    wishlist.items = wishlist.items.filter(item => item.productId !== productId);
    wishlist.totalItems = wishlist.items.length;

    this.saveWishlist(wishlist);

    // Dispatch event để header cập nhật số lượng
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist-changed'));
    }

    return wishlist;
  },

  // Xóa toàn bộ wishlist
  clearWishlist(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(WISHLIST_STORAGE_KEY);

    // Dispatch event để header cập nhật số lượng
    window.dispatchEvent(new Event('wishlist-changed'));
  },

  // Kiểm tra wishlist có rỗng không
  isEmpty(): boolean {
    const wishlist = this.getWishlist();
    return wishlist.items.length === 0;
  },

  // Lấy số lượng items trong wishlist
  getItemCount(): number {
    const wishlist = this.getWishlist();
    return wishlist.totalItems;
  },

  // Kiểm tra sản phẩm đã có trong wishlist chưa
  hasItem(productId: number): boolean {
    const wishlist = this.getWishlist();
    return wishlist.items.some(item => item.productId === productId);
  },

  // Toggle sản phẩm trong wishlist (add nếu chưa có, remove nếu đã có)
  toggleItem(item: Omit<WishlistItem, 'addedAt'>): Wishlist {
    if (this.hasItem(item.productId)) {
      return this.removeItem(item.productId);
    } else {
      return this.addItem(item);
    }
  },
};

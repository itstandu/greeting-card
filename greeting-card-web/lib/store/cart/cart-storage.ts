import { Cart, CartItem } from '@/types';

const CART_STORAGE_KEY = 'greeting_card_cart';

export const cartStorage = {
  // Lấy giỏ hàng từ localStorage
  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], total: 0, totalItems: 0 };
    }

    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartData) {
        return { items: [], total: 0, totalItems: 0 };
      }

      const cart: Cart = JSON.parse(cartData);
      return cart;
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return { items: [], total: 0, totalItems: 0 };
    }
  },

  // Lưu giỏ hàng vào localStorage
  saveCart(cart: Cart): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): Cart {
    const cart = this.getCart();

    // Tìm sản phẩm đã tồn tại
    const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);

    if (existingItemIndex > -1) {
      // Cập nhật số lượng (không vượt quá stock)
      const newQuantity = Math.min(cart.items[existingItemIndex].quantity + quantity, item.stock);
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Thêm sản phẩm mới
      cart.items.push({
        ...item,
        quantity: Math.min(quantity, item.stock),
      });
    }

    // Tính lại total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.saveCart(cart);

    // Dispatch event để header cập nhật số lượng
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-changed'));
    }

    return cart;
  },

  // Cập nhật số lượng sản phẩm
  updateItemQuantity(productId: number, quantity: number): Cart {
    const cart = this.getCart();

    if (quantity <= 0) {
      // Xóa item nếu quantity = 0
      return this.removeItem(productId);
    }

    const itemIndex = cart.items.findIndex(i => i.productId === productId);
    if (itemIndex > -1) {
      // Không vượt quá stock
      cart.items[itemIndex].quantity = Math.min(quantity, cart.items[itemIndex].stock);

      // Tính lại total
      cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      this.saveCart(cart);

      // Dispatch event để header cập nhật số lượng
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-changed'));
      }
    }

    return cart;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeItem(productId: number): Cart {
    const cart = this.getCart();

    cart.items = cart.items.filter(item => item.productId !== productId);

    // Tính lại total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.saveCart(cart);

    // Dispatch event để header cập nhật số lượng
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-changed'));
    }

    return cart;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(CART_STORAGE_KEY);

    // Dispatch event để header cập nhật số lượng
    window.dispatchEvent(new Event('cart-changed'));
  },

  // Kiểm tra giỏ hàng có rỗng không
  isEmpty(): boolean {
    const cart = this.getCart();
    return cart.items.length === 0;
  },

  // Lấy số lượng items trong giỏ hàng
  getItemCount(): number {
    const cart = this.getCart();
    return cart.totalItems;
  },

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  hasItem(productId: number): boolean {
    const cart = this.getCart();
    return cart.items.some(item => item.productId === productId);
  },

  // Lấy số lượng của một sản phẩm trong giỏ hàng
  getItemQuantity(productId: number): number {
    const cart = this.getCart();
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  },
};

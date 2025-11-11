export type CartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  quantity: number;
  stock: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  totalItems: number;
};

export type AddToCartRequest = {
  productId: number;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

export type SyncCartRequest = {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export type CartResponse = {
  id: number;
  items: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      slug: string;
      description?: string;
      price: number;
      stock: number;
      imageUrl: string;
    };
    quantity: number;
    subtotal: number;
  }>;
  total: number;
  totalItems: number;
};

export type CartSummary = {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
};

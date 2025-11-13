export type WishlistItem = {
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  stock: number;
  addedAt: string;
};

export type Wishlist = {
  items: WishlistItem[];
  totalItems: number;
};

export type AddToWishlistRequest = {
  productId: number;
};

export type SyncWishlistRequest = {
  productIds: Array<{
    productId: number;
  }>;
};

export type WishlistResponse = {
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
    addedAt: string;
  }>;
  totalItems: number;
};

export type WishlistSummary = {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  totalItems: number;
  updatedAt: string;
};

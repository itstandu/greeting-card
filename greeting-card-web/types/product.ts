import type { Category } from './category';

export type ProductImage = {
  id: number;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type ProductTag = {
  id: number;
  name: string;
  slug: string;
};

export type ReviewUser = {
  id: number;
  fullName: string;
};

export type ReviewProduct = {
  id: number;
  name: string;
  slug: string;
};

export type ProductReview = {
  id: number;
  user: ReviewUser;
  product: ReviewProduct;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number; // key is rating (1-5), value is count
  };
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  category: Category;
  images: ProductImage[];
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
  // User-specific flags (only set when user is authenticated)
  inWishlist?: boolean;
  inCart?: boolean;
};

export type ProductFilters = {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

export type ProductImageRequest = {
  imageUrl: string;
  altText?: string;
};

export type CreateProductRequest = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  categoryId: number;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: ProductImageRequest[];
  tagIds?: number[];
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type CreateReviewRequest = {
  rating: number;
  comment?: string;
};

export type UpdateReviewRequest = {
  rating?: number;
  comment?: string;
};

export type RejectReviewRequest = {
  reason: string;
};

export type ReviewFilters = {
  page?: number;
  size?: number;
  productId?: number;
  isApproved?: boolean;
  rating?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

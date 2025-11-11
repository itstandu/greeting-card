export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryFilters = {
  page?: number;
  size?: number;
  search?: string;
  parentId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

export type CreateCategoryRequest = {
  name: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

import { z } from 'zod';

export const productImageSchema = z.object({
  imageUrl: z.string(),
  altText: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  price: z.coerce.number().min(1000, 'Giá phải lớn hơn 1.000đ'),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(productImageSchema),
});

export type ProductFormValues = z.infer<typeof productSchema>;

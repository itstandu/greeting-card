import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().optional(),
  displayOrder: z.coerce.number().min(0, 'Thứ tự hiển thị phải >= 0').optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

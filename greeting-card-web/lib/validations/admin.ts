import { z } from 'zod';

export const editUserSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(255, 'Họ tên quá dài'),
  phone: z.string().max(20, 'Số điện thoại quá dài').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'CUSTOMER']),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ và tên không được để trống')
    .max(255, 'Họ và tên không được vượt quá 255 ký tự')
    .trim(),

  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .trim(),

  phone: z
    .string()
    .max(30, 'Số điện thoại không được vượt quá 30 ký tự')
    .optional()
    .or(z.literal('')),

  subject: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự')
    .trim(),

  category: z
    .string()
    .min(1, 'Vui lòng chọn chủ đề')
    .max(50, 'Chủ đề không được vượt quá 50 ký tự'),

  message: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(5000, 'Nội dung không được vượt quá 5000 ký tự')
    .trim(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

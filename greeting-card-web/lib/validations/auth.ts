import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
    'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;:,.<>?)',
  )
  .regex(/^\S*$/, 'Mật khẩu không được chứa khoảng trắng');

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Email không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email('Email không hợp lệ').min(1, 'Email không được để trống'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(255, 'Họ tên quá dài'),
    phone: z.string().max(20, 'Số điện thoại quá dài').optional().or(z.literal('')),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu và xác nhận mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Email không được để trống'),
});

export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

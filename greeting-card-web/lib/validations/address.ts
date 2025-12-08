import { z } from 'zod';

export const addressSchema = z.object({
  recipientName: z
    .string()
    .min(1, 'Tên người nhận không được để trống')
    .max(255, 'Tên người nhận không được vượt quá 255 ký tự')
    .trim(),

  phone: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
    .regex(
      /^(0|\+84)[1-9][0-9]{8,9}$/,
      'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (ví dụ: 0912345678 hoặc +84912345678)',
    )
    .trim(),

  addressLine1: z
    .string()
    .min(1, 'Địa chỉ không được để trống')
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự')
    .trim(),

  addressLine2: z
    .string()
    .max(255, 'Địa chỉ phụ không được vượt quá 255 ký tự')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .min(1, 'Thành phố/Tỉnh không được để trống')
    .max(100, 'Thành phố/Tỉnh không được vượt quá 100 ký tự')
    .trim(),

  district: z
    .string()
    .min(1, 'Quận/Huyện không được để trống')
    .max(100, 'Quận/Huyện không được vượt quá 100 ký tự')
    .trim(),

  ward: z
    .string()
    .min(1, 'Phường/Xã không được để trống')
    .max(100, 'Phường/Xã không được vượt quá 100 ký tự')
    .trim(),

  postalCode: z
    .string()
    .max(20, 'Mã bưu điện không được vượt quá 20 ký tự')
    .regex(/^[0-9]{5,6}$|^$/, 'Mã bưu điện phải là 5 hoặc 6 chữ số')
    .optional()
    .or(z.literal('')),

  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

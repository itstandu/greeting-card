'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { loginUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch } from '@/lib/store/hooks';
import { getLocalCartItemCount } from '@/lib/utils/cart-sync';
import { getLocalWishlistItemCount } from '@/lib/utils/wishlist-sync';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // Kiểm tra số lượng items trong localStorage cart và wishlist trước khi login
      const localCartItemCount = getLocalCartItemCount();
      const localWishlistItemCount = getLocalWishlistItemCount();

      const result = await dispatch(loginUser(values)).unwrap();

      // Use message from API response, fallback to default
      let message = result.message || 'Đăng nhập thành công';

      // Thêm thông báo nếu có cart được sync
      if (localCartItemCount > 0) {
        message = `${message}. Giỏ hàng của bạn (${localCartItemCount} sản phẩm) đã được đồng bộ.`;
      }

      // Thêm thông báo nếu có wishlist được sync
      if (localWishlistItemCount > 0) {
        const wishlistMessage = `Danh sách yêu thích của bạn (${localWishlistItemCount} sản phẩm) đã được đồng bộ.`;
        message =
          localCartItemCount > 0
            ? `${message} ${wishlistMessage}`
            : `${message}. ${wishlistMessage}`;
      }

      toast.success('Đăng nhập thành công', {
        description: message,
      });
      onSuccess?.();
      router.push('/');
    } catch (err) {
      const description =
        typeof err === 'string' ? err : err instanceof Error ? err.message : 'Đăng nhập thất bại';

      toast.error('Đăng nhập thất bại', {
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Nhập mật khẩu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right text-sm">
            <Link href="/auth/resend-verification" className="text-primary hover:underline">
              Chưa nhận được email xác thực?
            </Link>
          </div>

          <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">
            Đăng nhập
          </Button>
        </div>
      </form>
    </Form>
  );
}

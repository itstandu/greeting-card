'use client';

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
import { PasswordInput } from '@/components/ui/password-input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { changeUserPassword } from '@/lib/store/users/users.slice';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validations/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.users);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const result = await dispatch(
        changeUserPassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      ).unwrap();
      // Use message from API response, fallback to default
      const message = result.message || 'Đổi mật khẩu thành công';
      toast.success(message);
      form.reset();
      onSuccess?.();
    } catch (err) {
      // Error message already comes from API response via rejectWithValue
      const message = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại';
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu cũ</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Nhập mật khẩu cũ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Nhập mật khẩu mới" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Nhập lại mật khẩu mới" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

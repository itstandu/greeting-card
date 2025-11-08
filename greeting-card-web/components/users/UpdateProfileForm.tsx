'use client';

import { useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { updateUserProfile } from '@/lib/store/users/users.slice';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(255, 'Họ tên quá dài'),
  phone: z.string().max(20, 'Số điện thoại quá dài').optional().or(z.literal('')),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

interface UpdateProfileFormProps {
  onSuccess?: () => void;
}

export function UpdateProfileForm({ onSuccess }: UpdateProfileFormProps) {
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, error } = useAppSelector(state => state.users);
  const { user: authUser } = useAppSelector(state => state.auth);

  const user = currentUser || authUser;

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (values: UpdateProfileFormValues) => {
    try {
      const result = await dispatch(
        updateUserProfile({
          ...values,
          phone: values.phone || undefined,
        }),
      ).unwrap();
      // Use message from API response, fallback to default
      const message = result.message || 'Cập nhật thông tin thành công';
      toast.success(message);
      onSuccess?.();
    } catch (err) {
      // Error message already comes from API response via rejectWithValue
      const message = err instanceof Error ? err.message : 'Cập nhật thông tin thất bại';
      toast.error(message);
    }
  };

  if (!user) {
    return <p className="text-muted-foreground text-sm">Không có thông tin người dùng</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mb-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled className="mt-1" />
            <p className="text-muted-foreground mt-1 text-xs">Email không thể thay đổi</p>
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="0123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

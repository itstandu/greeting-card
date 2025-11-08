'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resendVerification } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Email không được để trống'),
});

type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

interface ResendVerificationFormProps {
  onSuccess?: () => void;
}

export function ResendVerificationForm({ onSuccess }: ResendVerificationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResendVerificationFormValues) => {
    setIsLoading(true);
    try {
      const response = await resendVerification(values);
      // Use message from API response, fallback to default
      const message = response.message || 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.';
      toast.success('Gửi email thành công', {
        description: message,
      });
      onSuccess?.();
      router.push('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gửi email thất bại';
      toast.error('Gửi email thất bại', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
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
                <FormDescription>Nhập email của bạn để nhận lại email xác thực</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Đang gửi...' : 'Gửi lại Email Xác Thực'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

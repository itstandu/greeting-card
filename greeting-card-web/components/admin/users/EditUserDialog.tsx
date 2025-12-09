'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { editUserSchema, type EditUserFormValues } from '@/lib/validations/admin';
import { updateAdminUser } from '@/services';
import type { AdminUpdateUserRequest, User, UserRole } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
};

type EditUserDialogProps = {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function EditUserDialog({ open, user, onOpenChange, onSaved }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      role: 'CUSTOMER',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        phone: user.phone || '',
        role: user.role,
      });
    }
  }, [user, form, open]);

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!user) return;
    const payload: AdminUpdateUserRequest = {
      fullName: values.fullName,
      phone: values.phone || undefined,
      role: values.role,
    };

    try {
      setIsSubmitting(true);
      const result = await updateAdminUser(user.id, payload);
      toast.success(result.message || 'Cập nhật người dùng thành công');
      onSaved();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Cập nhật người dùng thất bại';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật người dùng</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin cơ bản và vai trò của người dùng.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['ADMIN', 'CUSTOMER'] as UserRole[]).map(role => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

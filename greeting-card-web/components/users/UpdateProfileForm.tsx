'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { getInitials } from '@/lib/utils';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/lib/validations/user';
import { uploadUserAvatar } from '@/services/upload.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateProfileFormProps {
  onSuccess?: () => void;
}

export function UpdateProfileForm({ onSuccess }: UpdateProfileFormProps) {
  const dispatch = useAppDispatch();
  const { currentUser, isLoading, error } = useAppSelector(state => state.users);
  const { user: authUser } = useAppSelector(state => state.auth);

  const user = currentUser || authUser;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
    },
  });

  // Initialize form when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
      // Only update avatar preview if no file is selected
      if (!avatarFile) {
        setAvatarPreview(user.avatarUrl || null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.fullName, user?.phone, user?.avatarUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setIsSubmitting(true);
    try {
      let avatarUrl: string | undefined = undefined;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        try {
          const uploadResponse = await uploadUserAvatar(avatarFile);
          if (uploadResponse.data?.url) {
            avatarUrl = uploadResponse.data.url;
          }
        } catch {
          toast.error('Không thể upload avatar. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }
      }

      const result = await dispatch(
        updateUserProfile({
          ...values,
          phone: values.phone || undefined,
          avatarUrl,
        }),
      ).unwrap();
      // Use message from API response, fallback to default
      const message = result.message || 'Cập nhật thông tin thành công';
      toast.success(message);

      // Reset avatar file after successful update
      setAvatarFile(null);
      if (avatarUrl) {
        setAvatarPreview(avatarUrl);
      }

      onSuccess?.();
    } catch (err) {
      // Error message already comes from API response via rejectWithValue
      const message = err instanceof Error ? err.message : 'Cập nhật thông tin thất bại';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <p className="text-muted-foreground text-sm">Không có thông tin người dùng</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col gap-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4 border-b pb-4">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage src={avatarPreview || (user as { avatarUrl?: string })?.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {getInitials(user.fullName || user.email)}
                </AvatarFallback>
              </Avatar>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="bg-destructive hover:bg-destructive/90 absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                {avatarPreview ? 'Thay đổi ảnh' : 'Tải ảnh đại diện'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-muted-foreground text-xs">JPG, PNG hoặc GIF. Tối đa 5MB</p>
            </div>
          </div>

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

          <Button
            type="submit"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            Cập nhật thông tin
          </Button>
        </div>
      </form>
    </Form>
  );
}

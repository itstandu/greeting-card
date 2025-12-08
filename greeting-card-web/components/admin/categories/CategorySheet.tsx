'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
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
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import * as categoryService from '@/services/category.service';
import type { Category, CreateCategoryRequest } from '@/types';
import { categorySchema, type CategoryFormValues } from '@/lib/validations/category';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

type CategorySheetProps = {
  open: boolean;
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CategorySheet({ open, category, onOpenChange, onSaved }: CategorySheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: {
      name: '',
      description: '',
      parentId: undefined,
      imageUrl: '',
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        // Filter out current category and its children to prevent circular references
        const filteredCategories = category
          ? res.data.filter(c => c.id !== category.id && c.parentId !== category.id)
          : res.data;
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    if (open) {
      loadCategories();
    }
  }, [open, category]);

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId?.toString() || undefined,
        imageUrl: category.imageUrl || '',
        displayOrder: category.displayOrder ?? 0,
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        parentId: undefined,
        imageUrl: '',
        displayOrder: 0,
        isActive: true,
        isFeatured: false,
      });
    }
  }, [category, form, open]);

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: CreateCategoryRequest = {
        name: values.name,
        description: values.description || undefined,
        parentId: values.parentId ? parseInt(values.parentId) : undefined,
        imageUrl: values.imageUrl || undefined,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
        isFeatured: values.isFeatured,
      };

      if (category) {
        await categoryService.updateCategory(category.id, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.createCategory(payload);
        toast.success('Tạo danh mục thành công');
      }

      onSaved();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-4xl">
        <SheetHeader className="shrink-0 border-b shadow-sm">
          <SheetTitle>{category ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</SheetTitle>
          <SheetDescription>Điền thông tin chi tiết cho danh mục.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Thiệp sinh nhật" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục cha</FormLabel>
                      <Select
                        onValueChange={value =>
                          field.onChange(value === 'none' ? undefined : value)
                        }
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Không có (danh mục gốc)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Chọn danh mục cha để tạo danh mục con</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự hiển thị</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Số nhỏ hơn sẽ hiển thị trước</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh danh mục</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        folder="categories"
                        maxSizeMB={10}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Upload hình ảnh danh mục lên Cloudinary.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả về danh mục..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Trạng thái hoạt động</FormLabel>
                      <FormDescription>Danh mục sẽ hiển thị trên trang chủ</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Danh mục nổi bật</FormLabel>
                      <FormDescription>
                        Hiển thị danh mục ở vị trí nổi bật trên trang chủ
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter className="bg-background shrink-0 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={form.handleSubmit(handleSubmit)}>
            {isSubmitting ? 'Đang lưu...' : category ? 'Cập nhật danh mục' : 'Tạo danh mục'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

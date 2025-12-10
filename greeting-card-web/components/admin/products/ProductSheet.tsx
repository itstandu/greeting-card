'use client';

import { useEffect, useRef, useState } from 'react';
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
import { ImageUploadMultiple } from '@/components/ui/image-upload-multiple';
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
import { productSchema, type ProductFormValues } from '@/lib/validations/product';
import * as categoryService from '@/services/category.service';
import * as productService from '@/services/product.service';
import * as uploadService from '@/services/upload.service';
import type { Category, CreateProductRequest, Product, ProductImageRequest } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

type ProductSheetProps = {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function ProductSheet({ open, product, onOpenChange, onSaved }: ProductSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedImages, setUploadedImages] = useState<ProductImageRequest[]>([]); // Track images uploaded but not saved
  const savedSuccessfullyRef = useRef(false); // Use ref to avoid stale closure issues
  const wasOpenRef = useRef(false); // Track if sheet was previously open

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      sku: '',
      categoryId: '',
      isActive: true,
      isFeatured: false,
      images: [],
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    if (open) {
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      const productImages: ProductImageRequest[] = product.images.map(img => ({
        imageUrl: img.imageUrl,
        altText: img.altText || '',
      }));
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        sku: product.sku || '',
        categoryId: product.category?.id.toString() || '',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: productImages,
      });
      setUploadedImages([]); // Reset uploaded images when editing existing product
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        sku: '',
        categoryId: '',
        isActive: true,
        isFeatured: false,
        images: [],
      });
      setUploadedImages([]); // Reset when creating new product
    }
  }, [product, form, open]);

  const watchedImages = form.watch('images');

  // Track uploaded images when form images change
  useEffect(() => {
    const formImages = watchedImages || [];
    // Find images that are Cloudinary URLs and not from existing product
    const newUploadedImages = formImages.filter(
      img =>
        img.imageUrl.includes('cloudinary.com') &&
        (!product || !product.images.some(existing => existing.imageUrl === img.imageUrl)),
    );
    setUploadedImages(newUploadedImages);
  }, [watchedImages, product]);

  // Cleanup: Delete uploaded images when sheet closes without saving
  // Only run when sheet transitions from open -> closed (not on initial mount)
  useEffect(() => {
    // Only cleanup if sheet was previously open and is now closing
    // AND save was not successful
    if (wasOpenRef.current && !open && uploadedImages.length > 0 && !savedSuccessfullyRef.current) {
      const cleanup = async () => {
        for (const image of uploadedImages) {
          if (image.imageUrl.includes('cloudinary.com')) {
            try {
              await uploadService.deleteFile(image.imageUrl);
            } catch (error) {
              console.error('Failed to delete uploaded image:', image.imageUrl, error);
            }
          }
        }
        setUploadedImages([]);
      };
      cleanup();
    }

    // Update wasOpenRef after checking
    wasOpenRef.current = open;

    // Reset savedSuccessfullyRef when sheet closes
    if (!open) {
      savedSuccessfullyRef.current = false;
    }
  }, [open, uploadedImages]);

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: CreateProductRequest = {
        name: values.name,
        description: values.description,
        price: values.price,
        stock: product ? product.stock : 0,
        sku: values.sku || undefined,
        categoryId: parseInt(values.categoryId),
        isActive: values.isActive,
        isFeatured: values.isFeatured,
        images: values.images || [],
      };

      if (product) {
        await productService.updateProduct(product.id, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.createProduct(payload);
        toast.success('Tạo sản phẩm thành công');
      }

      // Mark as saved successfully BEFORE closing sheet
      // This prevents the cleanup useEffect from deleting the uploaded images
      savedSuccessfullyRef.current = true;
      setUploadedImages([]);
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
        <SheetHeader className="shrink-0">
          <SheetTitle>{product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</SheetTitle>
          <SheetDescription>Điền thông tin chi tiết cho sản phẩm.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Thiệp chúc mừng sinh nhật" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Tự động tạo nếu để trống" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán (VNĐ)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="mt-auto flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái kinh doanh</FormLabel>
                        <FormDescription>Sản phẩm sẽ hiển thị trên trang chủ</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Sản phẩm nổi bật</FormLabel>
                      <FormDescription>
                        Hiển thị sản phẩm ở vị trí nổi bật trên trang chủ
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh sản phẩm</FormLabel>
                    <FormControl>
                      <ImageUploadMultiple
                        value={field.value}
                        onChange={field.onChange}
                        folder="products"
                        maxSizeMB={10}
                        maxFiles={10}
                        disabled={isSubmitting}
                        productId={product?.id}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload hình ảnh sản phẩm lên Cloudinary. Kéo thả để sắp xếp thứ tự. Hình ảnh
                      đầu tiên sẽ là hình ảnh chính.
                    </FormDescription>
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
                        placeholder="Mô tả chi tiết về sản phẩm..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
            {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

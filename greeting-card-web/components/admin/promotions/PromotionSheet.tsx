'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
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
import { MultiSelectExpandable } from '@/components/ui/multi-select-expandable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  DISCOUNT_TYPE,
  getDiscountTypeLabel,
  getPromotionScopeLabel,
  getPromotionTypeLabel,
  PROMOTION_SCOPE,
  PROMOTION_TYPE,
} from '@/lib/constants';
import { createPromotion, getAllCategories, getProducts, updatePromotion } from '@/services';
import { Category, CreatePromotionRequest, Product, Promotion } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

const promotionSchema = z
  .object({
    name: z.string().min(3, 'Tên promotion phải có ít nhất 3 ký tự'),
    description: z.string().optional(),
    type: z.enum(['DISCOUNT', 'BOGO', 'BUY_X_GET_Y', 'BUY_X_PAY_Y']),
    scope: z.enum(['ORDER', 'PRODUCT', 'CATEGORY']),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
    discountValue: z.coerce.number().positive().optional(),
    minPurchase: z.coerce.number().min(0).optional().nullable(),
    maxDiscount: z.coerce.number().min(0).optional().nullable(),
    buyQuantity: z.coerce.number().positive().optional(),
    getQuantity: z.coerce.number().min(0).optional(),
    payQuantity: z.coerce.number().positive().optional(),
    productIds: z.array(z.coerce.number()).optional(),
    categoryId: z.coerce.number().optional().nullable(),
    validFrom: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    validUntil: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    isActive: z.boolean(),
  })
  .refine(
    data => {
      if (data.type === 'DISCOUNT') {
        return data.discountType && data.discountValue;
      }
      return true;
    },
    {
      message: 'DISCOUNT type phải có discountType và discountValue',
      path: ['discountType'],
    },
  )
  .refine(
    data => {
      if (data.type === 'BUY_X_GET_Y') {
        return data.buyQuantity && data.getQuantity;
      }
      return true;
    },
    {
      message: 'BUY_X_GET_Y type phải có buyQuantity và getQuantity',
      path: ['buyQuantity'],
    },
  )
  .refine(
    data => {
      if (data.type === 'BUY_X_PAY_Y') {
        return data.buyQuantity && data.payQuantity && data.payQuantity < data.buyQuantity!;
      }
      return true;
    },
    {
      message: 'BUY_X_PAY_Y type phải có buyQuantity và payQuantity (payQuantity < buyQuantity)',
      path: ['payQuantity'],
    },
  )
  .refine(
    data => {
      if (data.scope === 'PRODUCT') {
        return data.productIds && data.productIds.length > 0;
      }
      return true;
    },
    {
      message: 'PRODUCT scope phải chọn ít nhất một sản phẩm',
      path: ['productIds'],
    },
  )
  .refine(
    data => {
      if (data.scope === 'CATEGORY') {
        return data.categoryId;
      }
      return true;
    },
    {
      message: 'CATEGORY scope phải chọn danh mục',
      path: ['categoryId'],
    },
  )
  .refine(
    data => {
      const from = new Date(data.validFrom);
      const until = new Date(data.validUntil);
      return from < until;
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['validUntil'],
    },
  );

type PromotionFormValues = z.infer<typeof promotionSchema>;

type PromotionSheetProps = {
  open: boolean;
  promotion: Promotion | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function PromotionSheet({ open, promotion, onOpenChange, onSaved }: PromotionSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<PromotionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(promotionSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      type: 'DISCOUNT',
      scope: 'ORDER',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minPurchase: null,
      maxDiscount: null,
      buyQuantity: undefined,
      getQuantity: undefined,
      payQuantity: undefined,
      productIds: [],
      categoryId: null,
      validFrom: '',
      validUntil: '',
      usageLimit: null,
      isActive: true,
    },
  });

  const promotionType = form.watch('type');
  const promotionScope = form.watch('scope');
  const discountType = form.watch('discountType');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          getAllCategories(),
          getProducts({ page: 0, size: 1000 }),
        ]);
        setCategories(categoriesRes.data);
        setProducts(productsRes.data.products);
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (promotion) {
      form.reset({
        name: promotion.name,
        description: promotion.description || '',
        type: promotion.type,
        scope: promotion.scope,
        discountType: promotion.discountType || undefined,
        discountValue: promotion.discountValue || undefined,
        minPurchase: promotion.minPurchase || null,
        maxDiscount: promotion.maxDiscount || null,
        buyQuantity: promotion.buyQuantity || undefined,
        getQuantity: promotion.getQuantity || undefined,
        payQuantity: promotion.payQuantity || undefined,
        productIds: promotion.productIds || [],
        categoryId: promotion.categoryId || null,
        validFrom: promotion.validFrom,
        validUntil: promotion.validUntil,
        usageLimit: promotion.usageLimit || null,
        isActive: promotion.isActive,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        type: 'DISCOUNT',
        scope: 'ORDER',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minPurchase: null,
        maxDiscount: null,
        buyQuantity: undefined,
        getQuantity: undefined,
        payQuantity: undefined,
        productIds: [],
        categoryId: null,
        validFrom: '',
        validUntil: '',
        usageLimit: null,
        isActive: true,
      });
    }
  }, [promotion, form, open]);

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: CreatePromotionRequest = {
        name: data.name,
        description: data.description,
        type: data.type,
        scope: data.scope,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? undefined,
        maxDiscount: data.maxDiscount ?? undefined,
        buyQuantity: data.buyQuantity,
        getQuantity: data.getQuantity,
        payQuantity: data.payQuantity,
        productIds: data.productIds && data.productIds.length > 0 ? data.productIds : undefined,
        categoryId: data.categoryId ?? undefined,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        usageLimit: data.usageLimit ?? undefined,
        isActive: data.isActive,
      };

      if (promotion) {
        await updatePromotion(promotion.id, payload);
        toast.success('Cập nhật promotion thành công');
      } else {
        await createPromotion(payload);
        toast.success('Tạo promotion thành công');
      }

      onSaved();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể lưu promotion',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b shadow-sm">
          <SheetTitle>{promotion ? 'Cập nhật promotion' : 'Tạo promotion mới'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Tên promotion */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên promotion <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Khuyến mãi mùa hè" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mô tả */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả chi tiết về promotion..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loại promotion */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Loại promotion <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại promotion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PROMOTION_TYPE).map(type => (
                          <SelectItem key={type} value={type}>
                            {getPromotionTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phạm vi áp dụng */}
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phạm vi áp dụng <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phạm vi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PROMOTION_SCOPE).map(scope => (
                          <SelectItem key={scope} value={scope}>
                            {getPromotionScopeLabel(scope)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fields cho DISCOUNT type */}
              {promotionType === 'DISCOUNT' && (
                <>
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Loại giảm giá <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại giảm giá" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(DISCOUNT_TYPE).map(type => (
                              <SelectItem key={type} value={type}>
                                {getDiscountTypeLabel(type)}
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
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giá trị giảm giá <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={discountType === 'PERCENTAGE' ? '10' : '50000'}
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {discountType === 'PERCENTAGE'
                            ? 'Phần trăm giảm giá (0-100)'
                            : 'Số tiền giảm (VNĐ)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị đơn hàng tối thiểu</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Không giới hạn"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormDescription>Để trống nếu không yêu cầu</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {discountType === 'PERCENTAGE' && (
                    <FormField
                      control={form.control}
                      name="maxDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giảm giá tối đa (VNĐ)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Không giới hạn"
                              {...field}
                              value={field.value ?? ''}
                              onChange={e =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription>Giới hạn số tiền giảm tối đa khi dùng %</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {/* Fields cho BUY_X_GET_Y type */}
              {promotionType === 'BUY_X_GET_Y' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Số lượng mua (X) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="getQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Số lượng tặng (Y) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Fields cho BUY_X_PAY_Y type */}
              {promotionType === 'BUY_X_PAY_Y' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Số lượng mua (X) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Số lượng tính tiền (Y) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormDescription>Phải nhỏ hơn số lượng mua</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Fields cho PRODUCT scope */}
              {promotionScope === 'PRODUCT' && (
                <FormField
                  control={form.control}
                  name="productIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sản phẩm <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MultiSelectExpandable
                          label=""
                          items={products.map(product => ({
                            value: product.id.toString(),
                            label: product.name,
                          }))}
                          value={(field.value || []).map(id => id.toString())}
                          onChange={newValues => {
                            field.onChange(newValues.map(v => Number(v)));
                          }}
                          maxShownItems={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Đã chọn: {field.value?.length || 0} sản phẩm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Fields cho CATEGORY scope */}
              {promotionScope === 'CATEGORY' && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Danh mục <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={value => field.onChange(value ? Number(value) : null)}
                        value={field.value?.toString()}
                      >
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
              )}

              {/* Thời gian hiệu lực */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngày bắt đầu <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          label=""
                          value={field.value ? new Date(field.value) : null}
                          onChange={date => {
                            if (date) {
                              // Convert Date to ISO string format (YYYY-MM-DDTHH:mm:ss)
                              const isoString = date.toISOString().slice(0, 19);
                              field.onChange(isoString);
                            } else {
                              field.onChange('');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngày kết thúc <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          label=""
                          value={field.value ? new Date(field.value) : null}
                          onChange={date => {
                            if (date) {
                              // Convert Date to ISO string format (YYYY-MM-DDTHH:mm:ss)
                              const isoString = date.toISOString().slice(0, 19);
                              field.onChange(isoString);
                            } else {
                              field.onChange('');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Giới hạn sử dụng */}
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn sử dụng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Không giới hạn"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không giới hạn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trạng thái */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Kích hoạt</FormLabel>
                      <FormDescription>Promotion sẽ áp dụng cho đơn hàng</FormDescription>
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

        <SheetFooter className="shrink-0 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : promotion ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

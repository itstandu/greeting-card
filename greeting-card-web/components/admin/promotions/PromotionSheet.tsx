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
    name: z.string().min(3, 'Tên khuyến mãi phải có ít nhất 3 ký tự'),
    description: z.string().optional(),
    type: z.enum(['DISCOUNT', 'BOGO', 'BUY_X_GET_Y', 'BUY_X_PAY_Y'], {
      message: 'Vui lòng chọn loại khuyến mãi',
    }),
    scope: z.enum(['ORDER', 'PRODUCT', 'CATEGORY'], {
      message: 'Vui lòng chọn phạm vi áp dụng',
    }),
    // DISCOUNT type fields
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.coerce.number().positive().optional(),
    minPurchase: z.coerce.number().min(0).optional(),
    maxDiscount: z.coerce.number().positive().optional(),
    // BOGO/BUY_X_GET_Y/BUY_X_PAY_Y fields
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
  // Validate: ORDER scope chỉ cho phép DISCOUNT type
  .refine(
    data => {
      if (data.scope === 'ORDER') {
        return data.type === 'DISCOUNT';
      }
      return true;
    },
    {
      message: "Phạm vi 'Toàn bộ đơn hàng' chỉ hỗ trợ loại khuyến mãi 'Giảm giá'",
      path: ['type'],
    },
  )
  // Validate DISCOUNT type fields
  .refine(
    data => {
      if (data.type === 'DISCOUNT') {
        return data.discountType && data.discountValue && data.discountValue > 0;
      }
      return true;
    },
    {
      message: 'Loại giảm giá phải có loại giảm giá và giá trị giảm giá',
      path: ['discountValue'],
    },
  )
  .refine(
    data => {
      if (data.type === 'DISCOUNT' && data.discountType === 'PERCENTAGE') {
        return !data.discountValue || data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Phần trăm giảm giá không được vượt quá 100%',
      path: ['discountValue'],
    },
  )
  .refine(
    data => {
      if (data.type === 'BUY_X_GET_Y') {
        return data.buyQuantity && data.getQuantity !== undefined && data.getQuantity >= 0;
      }
      return true;
    },
    {
      message: 'Loại mua X tặng Y phải có số lượng mua và số lượng tặng',
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
      message:
        'Loại mua X trả Y phải có số lượng mua và số lượng tính tiền (số lượng tính tiền < số lượng mua)',
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
      message: 'Phạm vi sản phẩm phải chọn ít nhất một sản phẩm',
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
      message: 'Phạm vi danh mục phải chọn danh mục',
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
      discountValue: undefined,
      minPurchase: undefined,
      maxDiscount: undefined,
      buyQuantity: 1,
      getQuantity: 1,
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

  // Khi scope thay đổi sang ORDER, tự động chuyển type sang DISCOUNT
  // Vì ORDER scope chỉ hỗ trợ DISCOUNT type
  useEffect(() => {
    if (promotionScope === 'ORDER' && promotionType !== 'DISCOUNT') {
      form.setValue('type', 'DISCOUNT');
      // Reset các field của DISCOUNT type
      form.setValue('discountType', 'PERCENTAGE');
      form.setValue('discountValue', undefined);
    }
  }, [promotionScope, promotionType, form]);

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
        type: promotion.type as 'DISCOUNT' | 'BOGO' | 'BUY_X_GET_Y' | 'BUY_X_PAY_Y',
        scope: promotion.scope,
        discountType: promotion.discountType || undefined,
        discountValue: promotion.discountValue || undefined,
        minPurchase: promotion.minPurchase || undefined,
        maxDiscount: promotion.maxDiscount || undefined,
        buyQuantity: promotion.buyQuantity || 1,
        getQuantity: promotion.getQuantity || 1,
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
        discountValue: undefined,
        minPurchase: undefined,
        maxDiscount: undefined,
        buyQuantity: 1,
        getQuantity: 1,
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
        // DISCOUNT type fields
        discountType:
          data.type === 'DISCOUNT' && data.discountType
            ? (data.discountType as 'PERCENTAGE' | 'FIXED')
            : undefined,
        discountValue:
          data.type === 'DISCOUNT' && data.discountValue ? data.discountValue : undefined,
        minPurchase: data.type === 'DISCOUNT' && data.minPurchase ? data.minPurchase : undefined,
        maxDiscount: data.type === 'DISCOUNT' && data.maxDiscount ? data.maxDiscount : undefined,
        // BOGO/BUY_X_GET_Y/BUY_X_PAY_Y fields
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
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await createPromotion(payload);
        toast.success('Tạo khuyến mãi thành công');
      }

      onSaved();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: Record<string, string> } };
      };

      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as keyof PromotionFormValues, {
            type: 'server',
            message: message,
          });
        });
      } else {
        toast.error('Lỗi', {
          description: err.response?.data?.message || 'Không thể lưu khuyến mãi',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b shadow-sm">
          <SheetTitle>{promotion ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Tên khuyến mãi */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên khuyến mãi <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Mua 2 tặng 1 thiệp sinh nhật" {...field} />
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
                      <Textarea placeholder="Mô tả chi tiết về khuyến mãi..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phạm vi áp dụng - CHỌN TRƯỚC */}
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phạm vi áp dụng <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormDescription>
                      {promotionScope === 'ORDER' &&
                        'Áp dụng cho toàn bộ đơn hàng (chỉ hỗ trợ loại Giảm giá)'}
                      {promotionScope === 'PRODUCT' && 'Áp dụng cho các sản phẩm được chọn'}
                      {promotionScope === 'CATEGORY' &&
                        'Áp dụng cho tất cả sản phẩm trong danh mục'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fields cho PRODUCT scope */}
              {promotionScope === 'PRODUCT' && (
                <FormField
                  control={form.control}
                  name="productIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sản phẩm áp dụng <span className="text-destructive">*</span>
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
                        Danh mục áp dụng <span className="text-destructive">*</span>
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

              {/* Loại khuyến mãi - CHỌN SAU */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => {
                  // Nếu scope là ORDER, chỉ cho phép DISCOUNT
                  const availableTypes =
                    promotionScope === 'ORDER' ? ['DISCOUNT'] : Object.values(PROMOTION_TYPE);

                  return (
                    <FormItem>
                      <FormLabel>
                        Loại khuyến mãi <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại khuyến mãi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {getPromotionTypeLabel(type as keyof typeof PROMOTION_TYPE)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {promotionType === 'DISCOUNT' && 'Giảm giá theo % hoặc số tiền cố định'}
                        {promotionType === 'BOGO' && 'Mua 1 sản phẩm, tặng 1 sản phẩm cùng loại'}
                        {promotionType === 'BUY_X_GET_Y' && 'Mua X sản phẩm, tặng Y sản phẩm'}
                        {promotionType === 'BUY_X_PAY_Y' &&
                          'Mua X sản phẩm, chỉ tính tiền Y sản phẩm'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Fields cho DISCOUNT type */}
              {promotionType === 'DISCOUNT' && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Loại giảm giá <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại giảm giá" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                              <SelectItem value="FIXED">Số tiền cố định (VNĐ)</SelectItem>
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
                            Giá trị giảm <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={
                                form.watch('discountType') === 'PERCENTAGE' ? '10' : '50000'
                              }
                              value={field.value ?? ''}
                              onChange={e =>
                                field.onChange(e.target.value ? Number(e.target.value) : null)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch('discountType') === 'PERCENTAGE'
                              ? 'Tối đa 100%'
                              : 'Số tiền giảm (VNĐ)'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="minPurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Đơn tối thiểu</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value ?? ''}
                              onChange={e =>
                                field.onChange(e.target.value ? Number(e.target.value) : null)
                              }
                            />
                          </FormControl>
                          <FormDescription>Giá trị đơn hàng tối thiểu để áp dụng</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giảm tối đa</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Không giới hạn"
                              value={field.value ?? ''}
                              onChange={e =>
                                field.onChange(e.target.value ? Number(e.target.value) : null)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Số tiền giảm tối đa (chỉ áp dụng cho giảm %)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
                            placeholder="3"
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
                            placeholder="2"
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
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              const seconds = String(date.getSeconds()).padStart(2, '0');
                              field.onChange(
                                `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
                              );
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
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              const seconds = String(date.getSeconds()).padStart(2, '0');
                              field.onChange(
                                `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
                              );
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
                      <FormDescription>Khuyến mãi sẽ áp dụng cho đơn hàng</FormDescription>
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

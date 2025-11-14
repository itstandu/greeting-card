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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { DISCOUNT_TYPE, getDiscountTypeLabel } from '@/lib/constants';
import { createCoupon, updateCoupon } from '@/services';
import { Coupon, CreateCouponRequest, DiscountType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Mã coupon phải có ít nhất 3 ký tự')
      .max(50, 'Mã coupon không được quá 50 ký tự')
      .regex(/^[A-Z0-9_-]+$/, 'Mã chỉ được chứa chữ in hoa, số, gạch ngang và gạch dưới'),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number().positive('Giá trị giảm giá phải lớn hơn 0'),
    minPurchase: z.number().min(0, 'Giá trị tối thiểu phải >= 0').optional().nullable(),
    maxDiscount: z.number().min(0, 'Giảm tối đa phải >= 0').optional().nullable(),
    validFrom: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    validUntil: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    usageLimit: z.number().int().min(1, 'Giới hạn phải >= 1').optional().nullable(),
    isActive: z.boolean(),
  })
  .refine(
    data => {
      if (data.discountType === 'PERCENTAGE') {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Phần trăm giảm giá không được vượt quá 100',
      path: ['discountValue'],
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

type CouponFormValues = z.infer<typeof couponSchema>;

type CouponSheetProps = {
  open: boolean;
  coupon: Coupon | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CouponSheet({ open, coupon, onOpenChange, onSaved }: CouponSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minPurchase: null,
      maxDiscount: null,
      validFrom: '',
      validUntil: '',
      usageLimit: null,
      isActive: true,
    },
  });

  const discountType = form.watch('discountType');

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
      });
    } else {
      form.reset({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minPurchase: null,
        maxDiscount: null,
        validFrom: '',
        validUntil: '',
        usageLimit: null,
        isActive: true,
      });
    }
  }, [coupon, form, open]);

  const onSubmit = async (data: CouponFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: CreateCouponRequest = {
        code: data.code,
        discountType: data.discountType as DiscountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? undefined,
        maxDiscount: data.maxDiscount ?? undefined,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        usageLimit: data.usageLimit ?? undefined,
        isActive: data.isActive,
      };

      if (coupon) {
        await updateCoupon(coupon.id, payload);
        toast.success('Cập nhật coupon thành công');
      } else {
        await createCoupon(payload);
        toast.success('Tạo coupon thành công');
      }

      onSaved();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể lưu coupon',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b shadow-sm">
          <SheetTitle>{coupon ? 'Cập nhật coupon' : 'Tạo coupon mới'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Mã coupon */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã coupon <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: SUMMER2024"
                        {...field}
                        disabled={!!coupon}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormDescription>
                      Chỉ sử dụng chữ in hoa, số, gạch ngang và gạch dưới
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loại giảm giá */}
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

              {/* Giá trị giảm */}
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

              {/* Giá trị đơn hàng tối thiểu */}
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
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không yêu cầu</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Giảm tối đa (chỉ hiện với PERCENTAGE) */}
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
                        />
                      </FormControl>
                      <FormDescription>Giới hạn số tiền giảm tối đa khi dùng %</FormDescription>
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

              {/* Giới hạn số lần sử dụng */}
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn số lần sử dụng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Không giới hạn"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không giới hạn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trạng thái hoạt động */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Kích hoạt</FormLabel>
                      <FormDescription>Cho phép sử dụng coupon này</FormDescription>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {isSubmitting ? 'Đang lưu...' : coupon ? 'Cập nhật coupon' : 'Tạo coupon'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

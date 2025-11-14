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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Textarea } from '@/components/ui/textarea';
import {
  getStockTransactionTypeLabel,
  STOCK_TRANSACTION_TYPE,
  type StockTransactionType,
} from '@/lib/constants';
import { createStockTransaction } from '@/services';
import * as productService from '@/services/product.service';
import type { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

const stockTransactionSchema = z
  .object({
    productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT'] as const, { message: 'Vui lòng chọn loại giao dịch' }),
    quantity: z.coerce.number(),
    notes: z.string().optional(),
  })
  .refine(
    data => {
      if (data.type === 'ADJUSTMENT') {
        return data.quantity !== 0; // ADJUSTMENT phải khác 0
      }
      return data.quantity > 0; // IN và OUT phải > 0
    },
    {
      message: 'Số lượng phải khác 0',
      path: ['quantity'],
    },
  );

type StockTransactionFormValues = z.infer<typeof stockTransactionSchema>;

type StockTransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

const typeDescriptions: Record<StockTransactionType, string> = {
  IN: 'Thêm hàng vào kho',
  OUT: 'Xuất hàng ra khỏi kho',
  ADJUSTMENT: 'Điều chỉnh số lượng tồn kho (có thể tăng hoặc giảm)',
};

export function StockTransactionSheet({ open, onOpenChange, onSaved }: StockTransactionSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const form = useForm<StockTransactionFormValues>({
    resolver: zodResolver(stockTransactionSchema) as Resolver<StockTransactionFormValues>,
    defaultValues: {
      productId: '',
      type: 'IN',
      quantity: 1,
      notes: '',
    },
  });

  const selectedType = form.watch('type');
  const selectedProductId = form.watch('productId');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts({ page: 1, size: 1000 });
        setProducts(res.data.products);
      } catch (error) {
        console.error('Failed to load products', error);
      }
    };
    if (open) {
      loadProducts();
    }
  }, [open]);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id.toString() === selectedProductId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (!open) {
      form.reset({
        productId: '',
        type: 'IN',
        quantity: 1,
        notes: '',
      });
      setSelectedProduct(null);
    }
  }, [open, form]);

  const handleSubmit = async (values: StockTransactionFormValues) => {
    try {
      setIsSubmitting(true);

      await createStockTransaction({
        productId: parseInt(values.productId),
        type: values.type,
        quantity: values.quantity,
        notes: values.notes || undefined,
      });

      toast.success('Tạo giao dịch kho thành công');
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
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0">
          <SheetTitle>Tạo giao dịch kho</SheetTitle>
          <SheetDescription>Nhập/xuất kho hoặc điều chỉnh tồn kho sản phẩm.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sản phẩm</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sản phẩm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-muted-foreground text-xs">
                                SKU: {product.sku} | Tồn kho: {product.stock}
                              </span>
                            </div>
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại giao dịch</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-3"
                      >
                        <label
                          htmlFor="type-in"
                          className="hover:bg-accent flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors"
                        >
                          <RadioGroupItem value="IN" id="type-in" className="mt-1" />
                          <div className="flex-1 space-y-1">
                            <span className="leading-none font-medium">
                              {getStockTransactionTypeLabel(STOCK_TRANSACTION_TYPE.IN)}
                            </span>
                            <p className="text-muted-foreground text-sm">{typeDescriptions.IN}</p>
                          </div>
                        </label>
                        <label
                          htmlFor="type-out"
                          className="hover:bg-accent flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors"
                        >
                          <RadioGroupItem value="OUT" id="type-out" className="mt-1" />
                          <div className="flex-1 space-y-1">
                            <span className="leading-none font-medium">
                              {getStockTransactionTypeLabel(STOCK_TRANSACTION_TYPE.OUT)}
                            </span>
                            <p className="text-muted-foreground text-sm">{typeDescriptions.OUT}</p>
                          </div>
                        </label>
                        <label
                          htmlFor="type-adjustment"
                          className="hover:bg-accent flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors"
                        >
                          <RadioGroupItem
                            value="ADJUSTMENT"
                            id="type-adjustment"
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <span className="leading-none font-medium">
                              {getStockTransactionTypeLabel(STOCK_TRANSACTION_TYPE.ADJUSTMENT)}
                            </span>
                            <p className="text-muted-foreground text-sm">
                              {typeDescriptions.ADJUSTMENT}
                            </p>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProduct && (
                <div className="bg-muted/50 rounded-lg border p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Tồn kho hiện tại:</span>
                    <span className="font-medium">{selectedProduct.stock}</span>
                  </div>
                  {selectedType === STOCK_TRANSACTION_TYPE.IN && (
                    <div className="mt-1 flex justify-between text-green-600">
                      <span>Tồn kho sau nhập:</span>
                      <span className="font-medium">
                        {selectedProduct.stock + (form.watch('quantity') || 0)}
                      </span>
                    </div>
                  )}
                  {selectedType === STOCK_TRANSACTION_TYPE.OUT && (
                    <div className="mt-1 flex justify-between text-red-600">
                      <span>Tồn kho sau xuất:</span>
                      <span className="font-medium">
                        {Math.max(0, selectedProduct.stock - (form.watch('quantity') || 0))}
                      </span>
                    </div>
                  )}
                  {selectedType === 'ADJUSTMENT' && (
                    <div className="mt-1 flex justify-between">
                      <span>Tồn kho sau điều chỉnh:</span>
                      <span className="font-medium">
                        {selectedProduct.stock + (form.watch('quantity') || 0)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số lượng
                      {selectedType === 'ADJUSTMENT' && ' (có thể âm để giảm tồn kho)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          selectedType === 'ADJUSTMENT'
                            ? 'Nhập số lượng (có thể âm)'
                            : 'Nhập số lượng'
                        }
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          if (selectedType === STOCK_TRANSACTION_TYPE.ADJUSTMENT) {
                            // Cho phép số âm cho ADJUSTMENT
                            field.onChange(value === '' ? '' : parseInt(value) || 0);
                          } else {
                            // Chỉ cho phép số dương cho IN và OUT
                            field.onChange(value === '' ? '' : Math.abs(parseInt(value) || 0));
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedType === STOCK_TRANSACTION_TYPE.IN && 'Số lượng hàng nhập vào kho'}
                      {selectedType === STOCK_TRANSACTION_TYPE.OUT &&
                        'Số lượng hàng xuất ra khỏi kho'}
                      {selectedType === STOCK_TRANSACTION_TYPE.ADJUSTMENT &&
                        'Số lượng thay đổi (dương để tăng, âm để giảm)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập ghi chú về giao dịch..."
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
            {isSubmitting ? 'Đang tạo...' : 'Tạo giao dịch'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

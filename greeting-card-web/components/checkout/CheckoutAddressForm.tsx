'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addressSchema, type AddressFormValues } from '@/lib/validations/address';
import type { CreateAddressRequest } from '@/services/address.service';
import type { UserAddress } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, LoaderIcon, MapPin, Plus } from 'lucide-react';

interface CheckoutAddressFormProps {
  addresses: UserAddress[];
  selectedAddressId: number | null;
  showNewAddressForm: boolean;
  newAddress: CreateAddressRequest;
  newAddressLoading: boolean;
  onAddressSelect: (addressId: number) => void;
  onShowNewAddressForm: (show: boolean) => void;
  onNewAddressChange: (address: CreateAddressRequest) => void;
  onCreateAddress: () => Promise<void>;
}

export function CheckoutAddressForm({
  addresses,
  selectedAddressId,
  showNewAddressForm,
  newAddress,
  newAddressLoading,
  onAddressSelect,
  onShowNewAddressForm,
  onNewAddressChange,
  onCreateAddress,
}: CheckoutAddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      ward: '',
      postalCode: '',
      isDefault: false,
    },
  });

  // Sync form values with parent state when newAddress changes
  useEffect(() => {
    if (showNewAddressForm) {
      form.reset({
        recipientName: newAddress.recipientName || '',
        phone: newAddress.phone || '',
        addressLine1: newAddress.addressLine1 || '',
        addressLine2: newAddress.addressLine2 || '',
        city: newAddress.city || '',
        district: newAddress.district || '',
        ward: newAddress.ward || '',
        postalCode: newAddress.postalCode || '',
        isDefault: newAddress.isDefault || false,
      });
    }
  }, [showNewAddressForm, newAddress, form]);

  const onSubmit = async (values: AddressFormValues) => {
    // Update parent state with validated values
    onNewAddressChange({
      recipientName: values.recipientName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      city: values.city,
      district: values.district || undefined,
      ward: values.ward || undefined,
      postalCode: values.postalCode || undefined,
      isDefault: values.isDefault || false,
    });
    // Call parent's create handler
    await onCreateAddress();
  };

  const handleCancel = () => {
    form.reset();
    onShowNewAddressForm(false);
  };

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Địa chỉ giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length === 0 && !showNewAddressForm ? (
          <div className="py-8 text-center">
            <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
            <Button onClick={() => onShowNewAddressForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa chỉ mới
            </Button>
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedAddressId?.toString()}
              onValueChange={value => onAddressSelect(parseInt(value))}
            >
              {addresses.map(address => (
                <div
                  key={address.id}
                  className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onAddressSelect(address.id)}
                >
                  <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`address-${address.id}`}
                        className="cursor-pointer font-semibold"
                      >
                        {address.recipientName}
                      </Label>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Mặc định
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{address.phone}</p>
                    <p className="text-muted-foreground text-sm">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {[address.ward, address.district, address.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {!showNewAddressForm && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onShowNewAddressForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm địa chỉ mới
              </Button>
            )}
          </>
        )}

        {/* New Address Form */}
        {showNewAddressForm && (
          <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
            <h4 className="font-semibold">Thêm địa chỉ mới</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên người nhận <span className="text-destructive">*</span>
                        </FormLabel>
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
                        <FormLabel>
                          Số điện thoại <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0912345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Địa chỉ <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Số nhà, tên đường" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ phụ (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="Địa chỉ phụ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phường/Xã</FormLabel>
                        <FormControl>
                          <Input placeholder="Phường 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quận/Huyện</FormLabel>
                        <FormControl>
                          <Input placeholder="Quận 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Thành phố/Tỉnh <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="TP. Hồ Chí Minh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã bưu điện</FormLabel>
                      <FormControl>
                        <Input placeholder="700000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                    Hủy
                  </Button>
                  <Button type="submit" className="flex-1" disabled={newAddressLoading}>
                    {newAddressLoading ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Lưu địa chỉ
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

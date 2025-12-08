'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CreateAddressRequest } from '@/services/address.service';
import type { UserAddress } from '@/types';
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipientName">
                  Tên người nhận <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipientName"
                  placeholder="Nguyễn Văn A"
                  value={newAddress.recipientName}
                  onChange={e =>
                    onNewAddressChange({ ...newAddress, recipientName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="0912345678"
                  value={newAddress.phone}
                  onChange={e => onNewAddressChange({ ...newAddress, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">
                Địa chỉ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addressLine1"
                placeholder="Số nhà, tên đường"
                value={newAddress.addressLine1}
                onChange={e => onNewAddressChange({ ...newAddress, addressLine1: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input
                  id="ward"
                  placeholder="Phường 1"
                  value={newAddress.ward}
                  onChange={e => onNewAddressChange({ ...newAddress, ward: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  placeholder="Quận 1"
                  value={newAddress.district}
                  onChange={e => onNewAddressChange({ ...newAddress, district: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  Thành phố/Tỉnh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="TP. Hồ Chí Minh"
                  value={newAddress.city}
                  onChange={e => onNewAddressChange({ ...newAddress, city: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onShowNewAddressForm(false)}
              >
                Hủy
              </Button>
              <Button className="flex-1" onClick={onCreateAddress} disabled={newAddressLoading}>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

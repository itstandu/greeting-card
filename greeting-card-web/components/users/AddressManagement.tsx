'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { addressSchema, type AddressFormValues } from '@/lib/validations/address';
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
  updateAddress,
  type CreateAddressRequest,
} from '@/services/address.service';
import type { UserAddress } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, MapPin, Plus, Trash2 } from 'lucide-react';

export function AddressManagement() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

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

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getMyAddresses();
      if (response.data) {
        setAddresses(response.data);
      }
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách địa chỉ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDialog = (address?: UserAddress) => {
    if (address) {
      setEditingAddress(address);
      form.reset({
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        district: address.district || '',
        ward: address.ward || '',
        postalCode: address.postalCode || '',
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      form.reset({
        recipientName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        ward: '',
        postalCode: '',
        isDefault: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    form.reset();
  };

  const onSubmit = async (values: AddressFormValues) => {
    try {
      if (editingAddress) {
        // Update address
        const response = await updateAddress(editingAddress.id, values);
        if (response.data) {
          toast({
            title: 'Thành công',
            description: 'Đã cập nhật địa chỉ',
          });
          await fetchAddresses();
          handleCloseDialog();
        }
      } else {
        // Create new address
        const createData: CreateAddressRequest = {
          ...values,
          addressLine2: values.addressLine2 || undefined,
          district: values.district || undefined,
          ward: values.ward || undefined,
          postalCode: values.postalCode || undefined,
          isDefault: values.isDefault || false,
        };
        const response = await createAddress(createData);
        if (response.data) {
          toast({
            title: 'Thành công',
            description: 'Đã thêm địa chỉ mới',
          });
          await fetchAddresses();
          handleCloseDialog();
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Lỗi',
        description: errorMessage || 'Không thể lưu địa chỉ',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      setDeletingAddressId(id);
      await deleteAddress(id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa địa chỉ',
      });
      await fetchAddresses();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Lỗi',
        description: errorMessage || 'Không thể xóa địa chỉ',
        variant: 'destructive',
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      toast({
        title: 'Thành công',
        description: 'Đã đặt làm địa chỉ mặc định',
      });
      await fetchAddresses();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Lỗi',
        description: errorMessage || 'Không thể đặt địa chỉ mặc định',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Địa chỉ của tôi</h3>
          <p className="text-muted-foreground text-sm">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa chỉ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? 'Cập nhật thông tin địa chỉ của bạn'
                  : 'Thêm địa chỉ giao hàng mới'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên người nhận *</FormLabel>
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
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="0123456789" {...field} />
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
                      <FormLabel>Địa chỉ *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Đường ABC" {...field} />
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
                        <Input placeholder="Phường 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thành phố *</FormLabel>
                        <FormControl>
                          <Input placeholder="TP.HCM" {...field} />
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
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phường/Xã</FormLabel>
                        <FormControl>
                          <Input placeholder="Phường Bến Nghé" {...field} />
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

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mr-0 h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="flex items-center leading-none">
                        <FormLabel className="text-sm">Đặt làm địa chỉ mặc định</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Hủy
                  </Button>
                  <Button type="submit">{editingAddress ? 'Cập nhật' : 'Thêm'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Chưa có địa chỉ</h3>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Thêm địa chỉ để thuận tiện cho việc giao hàng
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa chỉ đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map(address => (
            <Card key={address.id} className={`py-6 ${address.isDefault ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{address.recipientName}</CardTitle>
                    {address.isDefault && (
                      <span className="bg-primary/10 text-primary mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(address)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingAddressId === address.id}
                      className="text-destructive hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{address.phone}</p>
                  <p className="text-muted-foreground">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-muted-foreground">{address.addressLine2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {[address.ward, address.district, address.city].filter(Boolean).join(', ')}
                  </p>
                  {address.postalCode && (
                    <p className="text-muted-foreground">Mã bưu điện: {address.postalCode}</p>
                  )}
                </div>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Đặt làm mặc định
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

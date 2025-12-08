'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreatePaymentMethodRequest, PaymentMethod } from '@/types';

interface PaymentMethodFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreatePaymentMethodRequest;
  onFormDataChange: (data: CreatePaymentMethodRequest) => void;
  selectedMethod: PaymentMethod | null;
  formLoading: boolean;
  onSubmit: () => Promise<void>;
}

export function PaymentMethodFormDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  selectedMethod,
  formLoading,
  onSubmit,
}: PaymentMethodFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedMethod ? 'Chỉnh sửa phương thức thanh toán' : 'Thêm phương thức thanh toán'}
          </DialogTitle>
          <DialogDescription>
            {selectedMethod
              ? 'Cập nhật thông tin phương thức thanh toán'
              : 'Tạo phương thức thanh toán mới'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="VD: Thanh toán khi nhận hàng"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Mã *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={e => onFormDataChange({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="VD: COD"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Mô tả phương thức thanh toán..."
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Kích hoạt</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={checked => onFormDataChange({ ...formData, isActive: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={formLoading}>
            {formLoading ? 'Đang xử lý...' : selectedMethod ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

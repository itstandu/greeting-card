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
import { Textarea } from '@/components/ui/textarea';

interface ReviewRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  onConfirm: () => Promise<void>;
}

export function ReviewRejectDialog({
  open,
  onOpenChange,
  rejectReason,
  onRejectReasonChange,
  onConfirm,
}: ReviewRejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối đánh giá</DialogTitle>
          <DialogDescription>Vui lòng nhập lý do từ chối đánh giá này.</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Lý do từ chối..."
          value={rejectReason}
          onChange={e => onRejectReasonChange(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={!rejectReason.trim()}>
            Từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

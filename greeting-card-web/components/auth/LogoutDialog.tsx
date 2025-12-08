'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { logoutUser } from '@/lib/store/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { toast } from 'sonner';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
}

// Dialog component for confirming logout action
export function LogoutDialog({ open, onOpenChange, redirectPath = '/' }: LogoutDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUser()).unwrap();
      toast.success('Đăng xuất thành công', {
        description: 'Bạn đã đăng xuất khỏi tài khoản của mình',
      });
      onOpenChange(false);
      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng xuất';
      toast.error('Đăng xuất thất bại', {
        description: errorMessage,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận đăng xuất</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut || isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut || isLoading}
          >
            {isLoggingOut || isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

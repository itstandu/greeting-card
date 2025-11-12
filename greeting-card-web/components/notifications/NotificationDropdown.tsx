'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { getNotificationTypeLabel } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { getUnreadCount, getUserNotifications, markAllAsRead } from '@/services';
import type { Notification } from '@/types';
import { Bell, CheckCheck, Package, Settings, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ORDER: ShoppingBag,
  PRODUCT: Package,
  SYSTEM: Settings,
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsRes, countRes] = await Promise.all([
        getUserNotifications(1, 10),
        getUnreadCount(),
      ]);
      setNotifications(notificationsRes.data || []);
      setUnreadCount(countRes.data.count);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Poll for updates when dropdown is open
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      getUnreadCount().then(res => setUnreadCount(res.data.count));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [open]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-1 h-3 w-3" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">Không có thông báo</div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map(notification => {
                const Icon = typeIcons[notification.type] || Bell;
                return (
                  <Link
                    key={notification.id}
                    href={notification.linkUrl || '#'}
                    className="hover:bg-accent block rounded-md p-2"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          notification.isRead ? 'bg-muted' : 'bg-primary/10'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${notification.isRead ? 'text-muted-foreground' : 'text-primary'}`}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${notification.isRead ? 'text-muted-foreground' : ''}`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {notification.message}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>{getNotificationTypeLabel(notification.type)}</span>
                          <span>•</span>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-2" />
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/notifications">Xem tất cả thông báo</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

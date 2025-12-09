'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  getNotificationTypeLabel,
  NOTIFICATION_TYPE,
  type NotificationType,
} from '@/lib/constants';
import { getNotificationLink } from '@/lib/notification-links';
import { formatDate } from '@/lib/utils';
import { getUnreadCount, getUserNotifications, markAllAsRead, markAsRead } from '@/services';
import type { Notification } from '@/types';
import { Bell, CheckCheck, Package, Settings, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ORDER: ShoppingBag,
  PRODUCT: Package,
  SYSTEM: Settings,
};

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filterIsRead, setFilterIsRead] = useState<boolean | undefined>(undefined);
  const [filterType, setFilterType] = useState<NotificationType | undefined>(undefined);

  const fetchNotifications = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const response = await getUserNotifications(currentPage, 10, filterIsRead, filterType);
      const newNotifications = response.data || [];
      if (reset) {
        setNotifications(newNotifications);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      setHasMore((response.pagination?.totalPages || 0) > currentPage);

      // Update unread count
      const countRes = await getUnreadCount();
      setUnreadCount(countRes.data.count);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterIsRead, filterType]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications(true);
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Không có thông báo mới'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select
          value={filterIsRead === undefined ? 'all' : filterIsRead ? 'read' : 'unread'}
          onValueChange={value => {
            setFilterIsRead(value === 'all' ? undefined : value === 'read' ? true : false);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unread">Chưa đọc</SelectItem>
            <SelectItem value="read">Đã đọc</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterType || 'all'}
          onValueChange={value => {
            setFilterType(value === 'all' ? undefined : (value as NotificationType));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.values(NOTIFICATION_TYPE).map(type => (
              <SelectItem key={type} value={type}>
                {getNotificationTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
            <Bell className="text-muted-foreground mb-4 h-16 w-16" />
            <h2 className="mb-2 text-2xl font-semibold">Không có thông báo</h2>
            <p className="text-muted-foreground text-center">
              Bạn chưa có thông báo nào. Chúng tôi sẽ thông báo cho bạn khi có cập nhật mới.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={notification.isRead ? '' : 'border-primary/50 bg-primary/5'}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.isRead ? 'bg-muted' : 'bg-primary/10'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${notification.isRead ? 'text-muted-foreground' : 'text-primary'}`}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${notification.isRead ? 'text-muted-foreground' : ''}`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span>{getNotificationTypeLabel(notification.type)}</span>
                        <span>•</span>
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.linkUrl && (
                          <>
                            <span>•</span>
                            <Link
                              href={getNotificationLink(notification)}
                              onClick={() => {
                                if (!notification.isRead) {
                                  handleMarkAsRead(notification.id);
                                }
                              }}
                              className="text-primary hover:underline"
                            >
                              Xem chi tiết
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Đang tải...
                  </>
                ) : (
                  'Tải thêm'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

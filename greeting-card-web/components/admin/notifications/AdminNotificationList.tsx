'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTableFilter, type ActiveFilter, type FilterField } from '@/components/admin/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getNotificationTypeLabel,
  NOTIFICATION_TYPE,
  type NotificationType,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { getUnreadCount, getUserNotifications, markAllAsRead, markAsRead } from '@/services';
import type { Notification, PaginationResponse } from '@/types';
import { Bell, CheckCheck, Package, Settings, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ORDER: ShoppingBag,
  PRODUCT: Package,
  SYSTEM: Settings,
};

export function AdminNotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIsRead, setFilterIsRead] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const isReadFilter =
        filterIsRead === 'ALL' ? undefined : filterIsRead === 'READ' ? true : false;
      const typeFilter = filterType === 'ALL' ? undefined : (filterType as NotificationType);

      const response = await getUserNotifications(
        pagination.page,
        pagination.size,
        isReadFilter,
        typeFilter,
      );

      setNotifications(response.data || []);
      setPagination(prev => response.pagination || prev);

      // Update unread count
      const countRes = await getUnreadCount();
      setUnreadCount(countRes.data.count);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filterIsRead, filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, refreshKey]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Đã đánh dấu đã đọc');
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setRefreshKey(key => key + 1);
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: 'isRead',
        label: 'Trạng thái',
        type: 'select',
        options: [
          { value: 'ALL', label: 'Tất cả' },
          { value: 'UNREAD', label: 'Chưa đọc' },
          { value: 'READ', label: 'Đã đọc' },
        ],
      },
      {
        key: 'type',
        label: 'Loại',
        type: 'select',
        options: [
          { value: 'ALL', label: 'Tất cả' },
          ...Object.values(NOTIFICATION_TYPE).map(type => ({
            value: type,
            label: getNotificationTypeLabel(type),
          })),
        ],
      },
    ],
    [],
  );

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (filterIsRead !== 'ALL') {
      filters.push({
        key: 'isRead',
        label: filterIsRead === 'READ' ? 'Đã đọc' : 'Chưa đọc',
        value: filterIsRead,
        displayValue: filterIsRead === 'READ' ? 'Đã đọc' : 'Chưa đọc',
      });
    }
    if (filterType !== 'ALL') {
      filters.push({
        key: 'type',
        label: getNotificationTypeLabel(filterType as NotificationType) || filterType,
        value: filterType,
        displayValue: getNotificationTypeLabel(filterType as NotificationType) || filterType,
      });
    }
    return filters;
  }, [filterIsRead, filterType]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === 'isRead') {
      setFilterIsRead(value);
    } else if (key === 'type') {
      setFilterType(value);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterIsRead('ALL');
    setFilterType('ALL');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const paginationSummary = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total);
    return `Hiển thị ${start}-${end} trong tổng số ${pagination.total} thông báo`;
  }, [pagination]);

  return (
    <Card className="py-6">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Quản lý thông báo</CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Không có thông báo mới'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminTableFilter
          searchValue={searchTerm}
          onSearchChange={value => {
            setSearchTerm(value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          searchPlaceholder="Tìm theo tiêu đề, nội dung..."
          filterFields={filterFields}
          onFilterChange={handleFilterChange}
          onRefresh={() => setRefreshKey(key => key + 1)}
          onClearFilters={handleClearFilters}
          isLoading={loading}
          activeFilters={activeFilters}
          totalCount={pagination.total}
          actionButton={
            unreadCount > 0 ? (
              <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
                <CheckCheck className="size-4" />
                Đánh dấu tất cả đã đọc
              </Button>
            ) : undefined
          }
        />

        <div className="w-full overflow-x-auto rounded-lg border bg-white">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] min-w-[100px] whitespace-nowrap">Loại</TableHead>
                <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">Tiêu đề</TableHead>
                <TableHead className="w-[350px] max-w-[400px] min-w-[250px]">Nội dung</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[160px] min-w-[150px] whitespace-nowrap">
                  Ngày tạo
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-64" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Bell className="text-muted-foreground h-12 w-12" />
                      <p className="text-muted-foreground text-sm">Không có thông báo</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map(notification => {
                  const Icon = typeIcons[notification.type] || Bell;
                  return (
                    <TableRow
                      key={notification.id}
                      className={notification.isRead ? '' : 'bg-primary/5'}
                    >
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                          <span
                            className="truncate text-sm"
                            title={getNotificationTypeLabel(notification.type)}
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[280px] max-w-[300px] min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium" title={notification.title}>
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[350px] max-w-[400px] min-w-[250px]">
                        <p
                          className="text-muted-foreground line-clamp-1 truncate text-sm"
                          title={notification.message}
                        >
                          {notification.message}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                          {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className="text-muted-foreground truncate text-sm"
                          title={formatDate(notification.createdAt)}
                        >
                          {formatDate(notification.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Đánh dấu đã đọc"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {notification.linkUrl && (
                            <Button variant="ghost" size="icon" asChild title="Xem chi tiết">
                              <Link href={notification.linkUrl}>
                                <ShoppingBag className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{paginationSummary}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1 || loading}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Trang</span>
              <Input
                type="number"
                min={1}
                max={Math.max(1, pagination.totalPages)}
                value={pagination.page}
                onChange={e => {
                  const value = parseInt(e.target.value, 10);
                  const maxPages = Math.max(1, pagination.totalPages);
                  if (!isNaN(value) && value >= 1 && value <= maxPages) {
                    setPagination(prev => ({ ...prev, page: value }));
                  }
                }}
                onBlur={e => {
                  const value = parseInt(e.target.value, 10);
                  const maxPages = Math.max(1, pagination.totalPages);
                  if (isNaN(value) || value < 1) {
                    setPagination(prev => ({ ...prev, page: 1 }));
                  } else if (value > maxPages) {
                    setPagination(prev => ({ ...prev, page: maxPages }));
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="h-8 w-16 text-center"
                disabled={loading}
              />
              <span className="text-sm">/ {Math.max(1, pagination.totalPages)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

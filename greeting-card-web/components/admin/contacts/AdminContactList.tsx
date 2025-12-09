'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  CONTACT_CATEGORIES,
  CONTACT_CATEGORY_LABELS,
  CONTACT_STATUS,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_VARIANTS,
  getContactStatusLabel,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
  deleteAdminContact,
  getAdminContacts,
  updateAdminContactStatus,
} from '@/services/contact.service';
import type { ContactMessage, ContactStatus } from '@/types';
import { AlertTriangle, Eye, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ContactFiltersState = {
  status: ContactStatus | 'ALL';
  category: string;
  search: string;
  page: number;
  size: number;
};

const STATUS_OPTIONS: Array<ContactStatus | 'ALL'> = [
  'ALL',
  CONTACT_STATUS.NEW,
  CONTACT_STATUS.IN_PROGRESS,
  CONTACT_STATUS.RESOLVED,
  CONTACT_STATUS.CLOSED,
];

export function AdminContactList() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ContactFiltersState>({
    status: 'ALL',
    category: 'ALL',
    search: '',
    page: 1,
    size: 10,
  });

  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<ContactStatus>(CONTACT_STATUS.NEW);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const normalizedFilters = useMemo(
    () => ({
      status: filters.status === 'ALL' ? undefined : (filters.status as ContactStatus),
      category: filters.category === 'ALL' ? undefined : filters.category,
      search: filters.search || undefined,
      page: filters.page,
      size: filters.size,
      sortBy: 'createdAt',
      sortDir: 'desc' as const,
    }),
    [filters],
  );

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        const response = await getAdminContacts(normalizedFilters);
        setContacts(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch (error) {
        const message = (error as Error)?.message || 'Không thể tải danh sách liên hệ';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [normalizedFilters, refreshKey]);

  const handleStatusChange = async () => {
    if (!selectedContact) return;
    try {
      await updateAdminContactStatus(selectedContact.id, statusToUpdate);
      toast.success('Cập nhật trạng thái thành công');
      setDetailOpen(false);
      setRefreshKey(key => key + 1);
    } catch (error) {
      const message = (error as Error)?.message || 'Không thể cập nhật trạng thái';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) return;
    try {
      await deleteAdminContact(selectedContact.id);
      toast.success('Đã xóa liên hệ');
      setDeleteOpen(false);
      setSelectedContact(null);
      setRefreshKey(key => key + 1);
    } catch (error) {
      const message = (error as Error)?.message || 'Không thể xóa liên hệ';
      toast.error(message);
    }
  };

  const paginationSummary = useMemo(() => {
    if (!pagination.total) return 'Chưa có liên hệ nào';
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total);
    return `Hiển thị ${start}-${end} / ${pagination.total} liên hệ`;
  }, [pagination]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Quản lý liên hệ</CardTitle>
          <CardDescription>
            Theo dõi và xử lý các yêu cầu người dùng gửi từ trang liên hệ.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative w-full lg:max-w-sm">
            <Input
              placeholder="Tìm theo tên, email, nội dung..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
          <div className="flex flex-1 flex-wrap gap-3">
            <Select
              value={filters.status}
              onValueChange={value =>
                setFilters(prev => ({
                  ...prev,
                  status: value as ContactStatus | 'ALL',
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>
                    {option === 'ALL' ? 'Tất cả' : getContactStatusLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={value => setFilters(prev => ({ ...prev, category: value, page: 1 }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chủ đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {CONTACT_CATEGORIES.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setRefreshKey(key => key + 1)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-40">Người gửi</TableHead>
                <TableHead className="min-w-50">Tiêu đề</TableHead>
                <TableHead className="min-w-35">Chủ đề</TableHead>
                <TableHead className="min-w-30">Trạng thái</TableHead>
                <TableHead className="min-w-40">Ngày gửi</TableHead>
                <TableHead className="w-[110px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                    Chưa có liên hệ nào
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{contact.fullName}</div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Mail className="h-4 w-4" />
                          <span className="truncate" title={contact.email}>
                            {contact.email}
                          </span>
                        </div>
                        {contact.phone && (
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px] truncate font-medium" title={contact.subject}>
                        {contact.subject}
                      </div>
                      <p
                        className="text-muted-foreground line-clamp-1 text-sm"
                        title={contact.message}
                      >
                        {contact.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {CONTACT_CATEGORY_LABELS[contact.category] || contact.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={CONTACT_STATUS_VARIANTS[contact.status]}>
                        {CONTACT_STATUS_LABELS[contact.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContact(contact);
                            setStatusToUpdate(contact.status);
                            setDetailOpen(true);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setSelectedContact(contact);
                            setDeleteOpen(true);
                          }}
                          title="Xóa liên hệ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">{paginationSummary}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
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
                    setFilters(prev => ({
                      ...prev,
                      page: value,
                    }));
                  }
                }}
                onBlur={e => {
                  const value = parseInt(e.target.value, 10);
                  const maxPages = Math.max(1, pagination.totalPages);
                  if (isNaN(value) || value < 1) {
                    setFilters(prev => ({ ...prev, page: 1 }));
                  } else if (value > maxPages) {
                    setFilters(prev => ({ ...prev, page: maxPages }));
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
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  page: Math.min(pagination.totalPages, prev.page + 1),
                }))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết liên hệ</DialogTitle>
            <DialogDescription>Xem nội dung và cập nhật trạng thái phản hồi.</DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm">Người gửi</p>
                  <p className="font-medium">{selectedContact.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <p className="text-muted-foreground text-sm">Số điện thoại</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm">Chủ đề</p>
                  <p className="font-medium">
                    {CONTACT_CATEGORY_LABELS[selectedContact.category] || selectedContact.category}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Tiêu đề</p>
                  <p className="font-medium">{selectedContact.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Thời gian</p>
                  <p className="font-medium">{formatDate(selectedContact.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Nội dung</p>
                <Textarea value={selectedContact.message} readOnly rows={5} />
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Trạng thái</p>
                <Select
                  value={statusToUpdate}
                  onValueChange={value => setStatusToUpdate(value as ContactStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CONTACT_STATUS).map(status => (
                      <SelectItem key={status} value={status}>
                        {getContactStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Đóng
            </Button>
            <Button onClick={handleStatusChange} disabled={!selectedContact}>
              Lưu trạng thái
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa liên hệ</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa liên hệ này? Hành động không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-3 rounded-md border p-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              {selectedContact ? (
                <>
                  Xóa liên hệ của <strong>{selectedContact.fullName}</strong> với tiêu đề{' '}
                  <strong>{selectedContact.subject}</strong>
                </>
              ) : (
                'Liên hệ không tồn tại'
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!selectedContact}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

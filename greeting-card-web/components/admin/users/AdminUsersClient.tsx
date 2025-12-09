'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminTableFilter, type ActiveFilter, type FilterField } from '@/components/admin/shared';
import { EditUserDialog } from '@/components/admin/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { deleteUser, getUsers } from '@/services';
import type { AdminUserFilters, PaginationResponse, User } from '@/types';
import { Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

const roleLabels: Record<'ADMIN' | 'CUSTOMER', string> = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
};

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN');
}

export function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<AdminUserFilters>({ page: 1, size: 10, role: 'ALL' });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [isLoading, setIsLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getUsers({
          ...filters,
          search: debouncedSearch || undefined,
        });
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Không thể tải danh sách người dùng';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [filters, debouncedSearch, refreshKey]);

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsLoading(true);
      const res = await deleteUser(deletingUser.id);
      toast.success(res.message || 'Xóa người dùng thành công');
      setRefreshKey(key => key + 1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Xóa người dùng thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
      setDeletingUser(null);
    }
  };

  const paginationSummary = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total);
    return pagination.total > 0 ? `${start} - ${end} / ${pagination.total}` : 'Không có dữ liệu';
  }, [pagination]);

  // Filter configuration
  const filterFields: FilterField[] = [
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select',
      placeholder: 'Lọc theo vai trò',
      value: (filters.role as string) || 'ALL',
      options: [
        { value: 'ALL', label: 'Tất cả vai trò' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'CUSTOMER', label: 'Customer' },
      ],
    },
  ];

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const result: ActiveFilter[] = [];
    if (filters.role && filters.role !== 'ALL') {
      result.push({
        key: 'role',
        label: 'Vai trò',
        value: filters.role,
        displayValue: roleLabels[filters.role as 'ADMIN' | 'CUSTOMER'],
      });
    }
    return result;
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value as AdminUserFilters['role'],
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ page: 1, size: 10, role: 'ALL' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Quản lý người dùng</CardTitle>
            <CardDescription>
              Theo dõi, cập nhật thông tin và phân quyền người dùng.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminTableFilter
            searchValue={searchTerm}
            onSearchChange={value => {
              setSearchTerm(value);
              setFilters(prev => ({ ...prev, page: 1 }));
            }}
            searchPlaceholder="Tìm theo email, họ tên, số điện thoại..."
            filterFields={filterFields}
            onFilterChange={handleFilterChange}
            onRefresh={() => setRefreshKey(key => key + 1)}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            activeFilters={activeFilters}
            totalCount={pagination.total}
          />

          <div className="w-full overflow-x-auto rounded-lg border bg-white">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] whitespace-nowrap">#</TableHead>
                  <TableHead className="w-[180px] max-w-[200px] min-w-[150px]">Họ tên</TableHead>
                  <TableHead className="w-[220px] max-w-[250px] min-w-[180px]">Email</TableHead>
                  <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                    Vai trò
                  </TableHead>
                  <TableHead className="w-[140px] min-w-[120px] whitespace-nowrap">
                    Trạng thái email
                  </TableHead>
                  <TableHead className="w-40 min-w-[150px] whitespace-nowrap">Ngày tạo</TableHead>
                  <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Users className="text-muted-foreground mb-4 size-12" />
                        <p className="text-muted-foreground">
                          Không có người dùng nào khớp với tiêu chí lọc
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="whitespace-nowrap">
                        {(pagination.page - 1) * pagination.size + index + 1}
                      </TableCell>
                      <TableCell className="truncate font-medium" title={user.fullName}>
                        {user.fullName}
                      </TableCell>
                      <TableCell className="truncate" title={user.email}>
                        {user.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={user.emailVerified ? 'outline' : 'destructive'}>
                          {user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleOpenEdit(user)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => setDeletingUser(user)}
                            title="Xóa"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground text-sm">Hiển thị {paginationSummary}</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setFilters(prev => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }))
              }
              disabled={pagination.page <= 1 || isLoading}
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
                    setFilters(prev => ({ ...prev, page: value }));
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
                disabled={isLoading}
              />
              <span className="text-sm">/ {Math.max(1, pagination.totalPages)}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  page:
                    pagination.totalPages === 0
                      ? 1
                      : Math.min((prev.page || 1) + 1, pagination.totalPages),
                }))
              }
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              Sau
            </Button>
          </div>
        </CardFooter>
      </Card>

      <EditUserDialog
        open={isEditOpen}
        user={editUser}
        onOpenChange={open => {
          setIsEditOpen(open);
          if (!open) {
            setEditUser(null);
          }
        }}
        onSaved={() => setRefreshKey(key => key + 1)}
      />

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={open => {
          if (!open) setDeletingUser(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng{' '}
              <span className="font-semibold">{deletingUser?.fullName}</span>? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  <span>Đang xóa...</span>
                </div>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

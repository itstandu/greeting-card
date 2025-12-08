'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CategorySheet } from '@/components/admin/categories';
import { AdminTableFilter, type ActiveFilter, type FilterField } from '@/components/admin/shared';
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
import * as categoryService from '@/services/category.service';
import type { Category, CategoryFilters, PaginationResponse } from '@/types';
import { ExternalLink, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<CategoryFilters>({ page: 1, size: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const response = await categoryService.getCategories({
          ...filters,
          search: debouncedSearch || undefined,
        });
        setCategories(response.data.categories);
        setPagination(response.data.pagination);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách danh mục';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [filters, debouncedSearch, refreshKey]);

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsLoading(true);
      const res = await categoryService.deleteCategory(deletingCategory.id);
      toast.success(res.message || 'Xóa danh mục thành công');
      setRefreshKey(key => key + 1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Xóa danh mục thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
      setDeletingCategory(null);
    }
  };

  const paginationSummary = useMemo(() => {
    if (!pagination || pagination.page === undefined || pagination.size === undefined) {
      return 'Không có dữ liệu';
    }
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total || 0);
    return pagination.total > 0 ? `${start} - ${end} / ${pagination.total}` : 'Không có dữ liệu';
  }, [pagination]);

  // Filter configuration
  const filterFields: FilterField[] = [
    {
      key: 'isActive',
      label: 'Trạng thái',
      type: 'select',
      placeholder: 'Trạng thái',
      value: filters.isActive === undefined ? 'ALL' : filters.isActive.toString(),
      options: [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        { value: 'true', label: 'Đang hoạt động' },
        { value: 'false', label: 'Ngừng hoạt động' },
      ],
    },
  ];

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const result: ActiveFilter[] = [];
    if (filters.isActive !== undefined) {
      result.push({
        key: 'isActive',
        label: 'Trạng thái',
        value: filters.isActive.toString(),
        displayValue: filters.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động',
      });
    }
    return result;
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value === 'ALL' || value === '' ? undefined : value === 'true',
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ page: 1, size: 10 });
  };

  return (
    <>
      <Card className="py-6">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Quản lý danh mục</CardTitle>
            <CardDescription>Danh sách danh mục, tạo mới và cập nhật thông tin.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminTableFilter
            searchValue={searchTerm}
            onSearchChange={value => {
              setSearchTerm(value);
              setFilters(prev => ({ ...prev, page: 1 }));
            }}
            searchPlaceholder="Tìm theo tên, mô tả..."
            filterFields={filterFields}
            onFilterChange={handleFilterChange}
            onRefresh={() => setRefreshKey(key => key + 1)}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            activeFilters={activeFilters}
            totalCount={pagination.total}
            actionButton={
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="size-4" />
                Thêm danh mục
              </Button>
            }
          />

          <div className="w-full overflow-x-auto rounded-lg border bg-white">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] whitespace-nowrap">#</TableHead>
                  <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">
                    Tên danh mục
                  </TableHead>
                  <TableHead className="w-[230px] max-w-[250px] min-w-[150px]">Slug</TableHead>
                  <TableHead className="w-[180px] max-w-[200px] min-w-[150px]">
                    Danh mục cha
                  </TableHead>
                  <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                    Thứ tự
                  </TableHead>
                  <TableHead className="w-[140px] min-w-[120px] whitespace-nowrap">
                    Trạng thái
                  </TableHead>
                  <TableHead className="w-[150px] min-w-[140px] text-right whitespace-nowrap">
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <FolderTree className="text-muted-foreground mb-4 size-12" />
                        <p className="text-muted-foreground">
                          Không có danh mục nào khớp với tiêu chí lọc
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category, index) => (
                    <TableRow key={category.id}>
                      <TableCell className="whitespace-nowrap">
                        {pagination && pagination.page && pagination.size
                          ? (pagination.page - 1) * pagination.size + index + 1
                          : index + 1}
                      </TableCell>
                      <TableCell className="w-[280px] max-w-[300px] min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="line-clamp-1 truncate font-medium" title={category.name}>
                            {category.name}
                          </span>
                          {category.description && (
                            <span className="text-muted-foreground line-clamp-1 truncate text-xs">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[230px] max-w-[250px] min-w-[150px]">
                        <span
                          className="text-muted-foreground truncate font-mono text-xs"
                          title={category.slug}
                        >
                          {category.slug}
                        </span>
                      </TableCell>
                      <TableCell className="w-[180px] max-w-[200px] min-w-[150px]">
                        <span className="truncate" title={category.parentName || '—'}>
                          {category.parentName || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {category.displayOrder ?? 0}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={category.isActive ? 'outline' : 'destructive'}
                          className={
                            category.isActive ? 'border-green-200 bg-green-50 text-green-700' : ''
                          }
                        >
                          {category.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" asChild title="Xem chi tiết">
                            <Link href={`/categories/${category.slug}`} target="_blank">
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => setDeletingCategory(category)}
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
              disabled={!pagination || !pagination.page || pagination.page <= 1 || isLoading}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Trang</span>
              <Input
                type="number"
                min={1}
                max={Math.max(1, pagination?.totalPages || 1)}
                value={pagination?.page || 1}
                onChange={e => {
                  const value = parseInt(e.target.value, 10);
                  const maxPages = Math.max(1, pagination?.totalPages || 1);
                  if (!isNaN(value) && value >= 1 && value <= maxPages) {
                    setFilters(prev => ({ ...prev, page: value }));
                  }
                }}
                onBlur={e => {
                  const value = parseInt(e.target.value, 10);
                  const maxPages = Math.max(1, pagination?.totalPages || 1);
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
              <span className="text-sm">/ {Math.max(1, pagination?.totalPages || 1)}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  page:
                    !pagination || pagination.totalPages === 0
                      ? 1
                      : Math.min((prev.page || 1) + 1, pagination.totalPages),
                }))
              }
              disabled={
                !pagination ||
                !pagination.page ||
                !pagination.totalPages ||
                pagination.page >= pagination.totalPages ||
                isLoading
              }
            >
              Sau
            </Button>
          </div>
        </CardFooter>
      </Card>

      <CategorySheet
        open={isDialogOpen}
        category={selectedCategory}
        onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        onSaved={() => setRefreshKey(key => key + 1)}
      />

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={open => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <span className="font-semibold">{deletingCategory?.name}</span>? Hành động này không
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

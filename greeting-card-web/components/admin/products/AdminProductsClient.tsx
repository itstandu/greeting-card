'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ProductSheet } from '@/components/admin/products';
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
import { SafeImage } from '@/components/ui/safe-image';
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
import * as productService from '@/services/product.service';
import type { PaginationResponse, Product, ProductFilters } from '@/types';
import { ExternalLink, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, size: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProducts({
          ...filters,
          search: debouncedSearch || undefined,
        });
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách sản phẩm';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [filters, debouncedSearch, refreshKey]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setIsLoading(true);
      const res = await productService.deleteProduct(deletingProduct.id);
      toast.success(res.message || 'Xóa sản phẩm thành công');
      setRefreshKey(key => key + 1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Xóa sản phẩm thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
      setDeletingProduct(null);
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
      key: 'isActive',
      label: 'Trạng thái',
      type: 'select',
      placeholder: 'Trạng thái',
      value: filters.isActive === undefined ? 'ALL' : filters.isActive.toString(),
      options: [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        { value: 'true', label: 'Đang kinh doanh' },
        { value: 'false', label: 'Ngừng kinh doanh' },
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
        displayValue: filters.isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh',
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
            <CardTitle>Quản lý sản phẩm</CardTitle>
            <CardDescription>Danh sách sản phẩm, tạo mới và cập nhật thông tin.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminTableFilter
            searchValue={searchTerm}
            onSearchChange={value => {
              setSearchTerm(value);
              setFilters(prev => ({ ...prev, page: 1 }));
            }}
            searchPlaceholder="Tìm theo tên, SKU, mô tả..."
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
                Thêm sản phẩm
              </Button>
            }
          />

          <div className="w-full overflow-x-auto rounded-lg border bg-white">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] whitespace-nowrap">#</TableHead>
                  <TableHead className="w-20 min-w-20 whitespace-nowrap">Ảnh</TableHead>
                  <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">
                    Tên sản phẩm
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Giá</TableHead>
                  <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                    Tồn kho
                  </TableHead>
                  <TableHead className="w-[180px] max-w-[200px] min-w-[150px]">Danh mục</TableHead>
                  <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
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
                        <Skeleton className="h-10 w-10 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
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
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Package className="text-muted-foreground mb-4 size-12" />
                        <p className="text-muted-foreground">
                          Không có sản phẩm nào khớp với tiêu chí lọc
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, index) => {
                    const primaryImage =
                      product.images.find(img => img.isPrimary) || product.images[0];
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="whitespace-nowrap">
                          {(pagination.page - 1) * pagination.size + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="bg-muted size-10 overflow-hidden rounded border">
                            <SafeImage
                              src={primaryImage?.imageUrl}
                              alt={product.name}
                              className="h-full w-full"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="w-[280px] max-w-[300px] min-w-[200px]">
                          <div className="flex flex-col">
                            <span
                              className="line-clamp-1 truncate font-medium"
                              title={product.name}
                            >
                              {product.name}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="truncate">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(product.price)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={product.stock === 0 ? 'text-destructive font-medium' : ''}
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="w-[180px] max-w-[200px] min-w-[150px]">
                          <span className="truncate" title={product.category?.name}>
                            {product.category?.name || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant={product.isActive ? 'outline' : 'destructive'}
                            className={
                              product.isActive ? 'border-green-200 bg-green-50 text-green-700' : ''
                            }
                          >
                            {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild title="Xem chi tiết">
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <ExternalLink className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                              title="Chỉnh sửa"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => setDeletingProduct(product)}
                              title="Xóa"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

      <ProductSheet
        open={isDialogOpen}
        product={selectedProduct}
        onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        onSaved={() => setRefreshKey(key => key + 1)}
      />

      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={open => {
          if (!open) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm{' '}
              <span className="font-semibold">{deletingProduct?.name}</span>? Hành động này không
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

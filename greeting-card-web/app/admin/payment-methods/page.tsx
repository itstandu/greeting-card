'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  createPaymentMethod,
  deletePaymentMethod,
  getAdminPaymentMethods,
  togglePaymentMethodStatus,
  updatePaymentMethod,
  updatePaymentMethodOrdering,
  type PaymentMethodFilters,
} from '@/services/payment-method.service';
import type {
  CreatePaymentMethodRequest,
  PaymentMethod,
  UpdatePaymentMethodRequest,
} from '@/types';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';

export default function AdminPaymentMethodsPage() {
  const { toast } = useToast();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<PaymentMethodFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    size: 10,
  });

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<CreatePaymentMethodRequest>({
    name: '',
    code: '',
    description: '',
    isActive: true,
    displayOrder: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const paginationSummary = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total);
    return pagination.total > 0 ? `${start} - ${end} / ${pagination.total}` : 'Không có dữ liệu';
  }, [pagination]);

  useEffect(() => {
    const loadMethods = async () => {
      setLoading(true);
      try {
        const response = await getAdminPaymentMethods(filters);
        setMethods(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách phương thức thanh toán',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshKey]);

  const handleCreate = () => {
    setSelectedMethod(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
      displayOrder: methods.length + 1,
    });
    setFormDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData({
      name: method.name,
      code: method.code,
      description: method.description || '',
      isActive: method.isActive,
      displayOrder: method.displayOrder,
    });
    setFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      if (selectedMethod) {
        // Update
        const updateData: UpdatePaymentMethodRequest = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder,
        };
        await updatePaymentMethod(selectedMethod.id, updateData);
        toast({ title: 'Thành công', description: 'Đã cập nhật phương thức thanh toán' });
      } else {
        // Create
        await createPaymentMethod(formData);
        toast({ title: 'Thành công', description: 'Đã tạo phương thức thanh toán mới' });
      }
      setFormDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: selectedMethod
          ? 'Không thể cập nhật phương thức thanh toán'
          : 'Không thể tạo phương thức thanh toán',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (method: PaymentMethod) => {
    try {
      await togglePaymentMethodStatus(method.id);
      toast({
        title: 'Thành công',
        description: `Đã ${method.isActive ? 'vô hiệu hóa' : 'kích hoạt'} phương thức thanh toán`,
      });
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể thay đổi trạng thái',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newMethods = Array.from(methods);
    const [reorderedItem] = newMethods.splice(sourceIndex, 1);
    newMethods.splice(destinationIndex, 0, reorderedItem);

    // Optimistically update UI
    setMethods(newMethods);

    // Update displayOrder for all items
    const items = newMethods.map((m, i) => ({ id: m.id, displayOrder: i + 1 }));

    try {
      await updatePaymentMethodOrdering({ items });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thứ tự phương thức thanh toán',
      });
      setRefreshKey(prev => prev + 1);
    } catch {
      // Revert on error
      setRefreshKey(prev => prev + 1);
      toast({
        title: 'Lỗi',
        description: 'Không thể thay đổi thứ tự',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedMethod) return;

    try {
      await deletePaymentMethod(selectedMethod.id);
      toast({ title: 'Thành công', description: 'Đã xóa phương thức thanh toán' });
      setDeleteDialogOpen(false);
      setSelectedMethod(null);
      setRefreshKey(prev => prev + 1);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phương thức thanh toán. Có thể đã được sử dụng trong đơn hàng.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phương thức thanh toán</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tên, mã..."
            value={filters.search || ''}
            onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
          onValueChange={value =>
            setFilters({
              ...filters,
              isActive: value === 'all' ? undefined : value === 'true',
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Đã vô hiệu</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setRefreshKey(prev => prev + 1)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="payment-methods">
              {provided => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={`loading-${index}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : methods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center">
                        Không có phương thức thanh toán nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    methods.map((method, index) => (
                      <Draggable key={method.id} draggableId={String(method.id)} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              snapshot.isDragging && 'bg-muted/50',
                              'transition-colors',
                            )}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="text-muted-foreground h-5 w-5" />
                                </div>
                                <span className="font-medium">{method.displayOrder}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{method.name}</TableCell>
                            <TableCell>
                              <code className="bg-muted rounded px-2 py-1 text-sm">
                                {method.code}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div
                                className="max-w-[200px] truncate"
                                title={method.description || ''}
                              >
                                {method.description || '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {method.isActive ? (
                                <Badge className="bg-green-500">Hoạt động</Badge>
                              ) : (
                                <Badge variant="secondary">Vô hiệu</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {method.createdAt
                                ? format(new Date(method.createdAt), 'dd/MM/yyyy', { locale: vi })
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleStatus(method)}
                                  title={method.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                >
                                  {method.isActive ? (
                                    <ToggleRight className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(method)}
                                  title="Chỉnh sửa"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedMethod(method);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Hiển thị {paginationSummary}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
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
                  setFilters({ ...filters, page: value });
                }
              }}
              onBlur={e => {
                const value = parseInt(e.target.value, 10);
                const maxPages = Math.max(1, pagination.totalPages);
                if (isNaN(value) || value < 1) {
                  setFilters({ ...filters, page: 1 });
                } else if (value > maxPages) {
                  setFilters({ ...filters, page: maxPages });
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
            onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
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
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Thanh toán khi nhận hàng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Mã *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: COD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả phương thức thanh toán..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Kích hoạt</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? 'Đang xử lý...' : selectedMethod ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phương thức thanh toán &quot;{selectedMethod?.name}&quot;?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

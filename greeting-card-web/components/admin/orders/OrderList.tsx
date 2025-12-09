'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OrderSheet } from '@/components/admin/orders';
import { AdminTableFilter, type ActiveFilter, type FilterField } from '@/components/admin/shared';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  ORDER_STATUS,
  type OrderStatus,
} from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getAllOrders, searchOrders, updateOrderStatus } from '@/services';
import { OrderSimple, UpdateOrderStatusRequest } from '@/types';
import { Eye, Package, Pencil, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function OrderList() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 300);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 10;

  const paginationSummary = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalOrders);
    return totalOrders > 0 ? `${start} - ${end} / ${totalOrders}` : 'Không có dữ liệu';
  }, [currentPage, totalOrders, pageSize]);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderSimple | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (debouncedSearch) {
        response = await searchOrders(debouncedSearch, {
          page: currentPage,
          size: 10,
        });
      } else if (selectedStatus !== 'ALL') {
        response = await getAllOrders({
          page: currentPage,
          size: 10,
          status: selectedStatus,
        });
      } else {
        response = await getAllOrders({
          page: currentPage,
          size: 10,
        });
      }

      setOrders(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalOrders(response.pagination?.total || 0);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải danh sách đơn hàng',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Check for orderId in query params and open sheet
  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      const orderId = parseInt(orderIdParam, 10);
      if (!isNaN(orderId)) {
        setSelectedOrderId(orderId);
        setIsOrderSheetOpen(true);
        // Clean up URL
        window.history.replaceState({}, '', '/admin/orders');
      }
    }
  }, [searchParams]);

  // Filter configuration
  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      placeholder: 'Trạng thái',
      value: selectedStatus,
      options: [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        ...Object.values(ORDER_STATUS).map(status => ({
          value: status,
          label: getOrderStatusLabel(status),
        })),
      ],
    },
  ];

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const result: ActiveFilter[] = [];
    if (selectedStatus !== 'ALL') {
      result.push({
        key: 'status',
        label: 'Trạng thái',
        value: selectedStatus,
        displayValue: getOrderStatusLabel(selectedStatus as OrderStatus),
      });
    }
    return result;
  }, [selectedStatus]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setSelectedStatus(value || 'ALL');
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedStatus('ALL');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleOpenUpdateDialog = (order: OrderSimple) => {
    setEditingOrder(order);
    const availableStatuses = getAvailableStatuses(order.status);
    // Set giá trị đầu tiên trong danh sách available statuses, hoặc empty string nếu không có
    setNewStatus(availableStatuses.length > 0 ? availableStatuses[0] : '');
    setAdminNotes('');
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder || !newStatus || newStatus === editingOrder.status) return;

    try {
      setUpdatingOrderId(editingOrder.id);
      const request: UpdateOrderStatusRequest = {
        status: newStatus as OrderStatus,
        notes: adminNotes || undefined,
      };
      await updateOrderStatus(editingOrder.id, request);
      toast.success('Đã cập nhật trạng thái đơn hàng');
      setIsUpdateDialogOpen(false);
      setEditingOrder(null);
      setNewStatus('');
      setAdminNotes('');
      fetchOrders();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể cập nhật trạng thái',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Lấy các trạng thái có thể chuyển đổi từ trạng thái hiện tại
  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
      [ORDER_STATUS.DELIVERED]: [], // Không thể chuyển từ DELIVERED
      [ORDER_STATUS.CANCELLED]: [], // Không thể chuyển từ CANCELLED
    };
    return statusFlow[currentStatus] || [];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Quản lý đơn hàng</CardTitle>
          <CardDescription>Xem và quản lý tất cả đơn hàng trong hệ thống</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminTableFilter
          searchValue={searchKeyword}
          onSearchChange={value => {
            setSearchKeyword(value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm theo mã đơn hàng, email, tên khách hàng..."
          filterFields={filterFields}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          onClearFilters={handleClearFilters}
          isLoading={loading}
          activeFilters={activeFilters}
          totalCount={totalOrders}
        />

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-lg border">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 min-w-[150px] whitespace-nowrap">Mã đơn hàng</TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Ngày đặt
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Tổng tiền
                </TableHead>
                <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                  Số items
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                  Thanh toán
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                  Thao tác
                </TableHead>
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
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Package className="text-muted-foreground mb-4 size-12" />
                      <p className="text-muted-foreground">Không có đơn hàng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <span className="truncate" title={order.orderNumber}>
                        {order.orderNumber}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(order.orderDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatCurrency(order.finalAmount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{order.totalItems}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem chi tiết"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setIsOrderSheetOpen(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Cập nhật trạng thái"
                          onClick={() => handleOpenUpdateDialog(order)}
                          disabled={updatingOrderId === order.id}
                        >
                          {updatingOrderId === order.id ? (
                            <RefreshCw className="size-4 animate-spin" />
                          ) : (
                            <Pencil className="size-4" />
                          )}
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
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            Trước
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">Trang</span>
            <Input
              type="number"
              min={1}
              max={Math.max(1, totalPages)}
              value={currentPage}
              onChange={e => {
                const value = parseInt(e.target.value, 10);
                const maxPages = Math.max(1, totalPages);
                if (!isNaN(value) && value >= 1 && value <= maxPages) {
                  setCurrentPage(value);
                }
              }}
              onBlur={e => {
                const value = parseInt(e.target.value, 10);
                const maxPages = Math.max(1, totalPages);
                if (isNaN(value) || value < 1) {
                  setCurrentPage(1);
                } else if (value > maxPages) {
                  setCurrentPage(maxPages);
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
            <span className="text-sm">/ {Math.max(1, totalPages)}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || loading}
          >
            Sau
          </Button>
        </div>
      </CardFooter>

      <OrderSheet
        open={isOrderSheetOpen}
        orderId={selectedOrderId}
        onOpenChange={(open: boolean) => {
          setIsOrderSheetOpen(open);
          if (!open) {
            setSelectedOrderId(null);
          }
        }}
        onSaved={() => {
          fetchOrders();
        }}
      />

      {/* Dialog cập nhật trạng thái */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              {editingOrder && `Đơn hàng: ${editingOrder.orderNumber}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Trạng thái mới</Label>
              <Select
                value={newStatus || undefined}
                onValueChange={value => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {editingOrder &&
                    getAvailableStatuses(editingOrder.status).length > 0 &&
                    getAvailableStatuses(editingOrder.status).map(status => (
                      <SelectItem key={status} value={status}>
                        {getOrderStatusLabel(status)}
                      </SelectItem>
                    ))}
                  {editingOrder && getAvailableStatuses(editingOrder.status).length === 0 && (
                    <SelectItem value={editingOrder.status} disabled>
                      {getOrderStatusLabel(editingOrder.status)} (Không thể thay đổi)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú admin (tùy chọn)</Label>
              <Textarea
                placeholder="Nhập ghi chú khi thay đổi trạng thái..."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false);
                setEditingOrder(null);
                setNewStatus('');
                setAdminNotes('');
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                !newStatus ||
                !editingOrder ||
                newStatus === editingOrder.status ||
                updatingOrderId === editingOrder.id
              }
            >
              {updatingOrderId === editingOrder?.id ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </div>
              ) : (
                'Cập nhật'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

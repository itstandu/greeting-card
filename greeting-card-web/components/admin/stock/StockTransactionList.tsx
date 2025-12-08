'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTableFilter, type ActiveFilter, type FilterField } from '@/components/admin/shared';
import { StockTransactionDetailSheet, StockTransactionSheet } from '@/components/admin/stock';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import {
  getStockTransactionTypeColor,
  getStockTransactionTypeLabel,
  STOCK_TRANSACTION_TYPE,
  type StockTransactionType,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { getStockTransactions } from '@/services';
import type { StockTransaction, StockTransactionFilters } from '@/types';
import { Eye, Plus, Warehouse } from 'lucide-react';
import { toast } from 'sonner';

export function StockTransactionList() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 300);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const pageSize = 10;

  const paginationSummary = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalTransactions);
    return totalTransactions > 0 ? `${start} - ${end} / ${totalTransactions}` : 'Không có dữ liệu';
  }, [currentPage, totalTransactions, pageSize]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const filters: StockTransactionFilters = {
        page: currentPage,
        size: 10,
        keyword: debouncedSearch || undefined,
        type: selectedType !== 'ALL' ? (selectedType as 'IN' | 'OUT' | 'ADJUSTMENT') : undefined,
      };
      const response = await getStockTransactions(filters);
      setTransactions(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalTransactions(response.pagination?.total || 0);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Lỗi', {
        description: err.response?.data?.message || 'Không thể tải danh sách giao dịch kho',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, selectedType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filterFields: FilterField[] = [
    {
      key: 'type',
      label: 'Loại giao dịch',
      type: 'select',
      placeholder: 'Loại giao dịch',
      value: selectedType,
      options: [
        { value: 'ALL', label: 'Tất cả' },
        ...Object.values(STOCK_TRANSACTION_TYPE).map(type => ({
          value: type,
          label: getStockTransactionTypeLabel(type),
        })),
      ],
    },
  ];

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const result: ActiveFilter[] = [];
    if (selectedType !== 'ALL') {
      result.push({
        key: 'type',
        label: 'Loại giao dịch',
        value: selectedType,
        displayValue: getStockTransactionTypeLabel(selectedType as StockTransactionType),
      });
    }
    return result;
  }, [selectedType]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'type') {
      setSelectedType(value || 'ALL');
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedType('ALL');
    setCurrentPage(1);
  };

  return (
    <>
      <Card className="py-6">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Quản lý kho</CardTitle>
            <CardDescription>Nhập kho, xuất kho và điều chỉnh tồn kho sản phẩm</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminTableFilter
            searchValue={searchKeyword}
            onSearchChange={value => {
              setSearchKeyword(value);
              setCurrentPage(1);
            }}
            searchPlaceholder="Tìm theo tên sản phẩm, SKU..."
            filterFields={filterFields}
            onFilterChange={handleFilterChange}
            onRefresh={fetchTransactions}
            onClearFilters={handleClearFilters}
            isLoading={loading}
            activeFilters={activeFilters}
            totalCount={totalTransactions}
            actionButton={
              <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
                <Plus className="size-4" />
                Tạo giao dịch kho
              </Button>
            }
          />

          <div className="w-full overflow-x-auto rounded-lg border">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] whitespace-nowrap">#</TableHead>
                  <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">Sản phẩm</TableHead>
                  <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">Loại</TableHead>
                  <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap">
                    Số lượng
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                    Tồn kho trước
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap">
                    Tồn kho sau
                  </TableHead>
                  <TableHead className="w-[180px] max-w-[200px] min-w-[150px]">
                    Người thực hiện
                  </TableHead>
                  <TableHead className="w-40 min-w-[150px] whitespace-nowrap">Ngày tạo</TableHead>
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
                        <Skeleton className="h-4 w-10" />
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
                        <Skeleton className="h-4 w-20" />
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
                        <Skeleton className="ml-auto h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Warehouse className="text-muted-foreground mb-4 size-12" />
                        <p className="text-muted-foreground">
                          Không có giao dịch nào khớp với tiêu chí lọc
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction, index) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{(currentPage - 1) * 20 + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.productName}</span>
                          <span className="text-muted-foreground text-xs">
                            SKU: {transaction.productSku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStockTransactionTypeColor(transaction.type)}>
                          {getStockTransactionTypeLabel(transaction.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.type === STOCK_TRANSACTION_TYPE.IN
                              ? 'font-medium text-green-600'
                              : transaction.type === STOCK_TRANSACTION_TYPE.OUT
                                ? 'font-medium text-red-600'
                                : 'font-medium'
                          }
                        >
                          {transaction.type === STOCK_TRANSACTION_TYPE.IN && '+'}
                          {transaction.type === STOCK_TRANSACTION_TYPE.OUT && '-'}
                          {transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.stockBefore}</TableCell>
                      <TableCell>
                        <span className="font-medium">{transaction.stockAfter}</span>
                      </TableCell>
                      <TableCell>{transaction.createdBy}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem chi tiết"
                          onClick={() => {
                            setSelectedTransactionId(transaction.id);
                            setIsDetailSheetOpen(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
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
      </Card>

      <StockTransactionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSaved={() => {
          fetchTransactions();
        }}
      />

      <StockTransactionDetailSheet
        open={isDetailSheetOpen}
        transactionId={selectedTransactionId}
        onOpenChange={open => {
          setIsDetailSheetOpen(open);
          if (!open) {
            setSelectedTransactionId(null);
          }
        }}
      />
    </>
  );
}

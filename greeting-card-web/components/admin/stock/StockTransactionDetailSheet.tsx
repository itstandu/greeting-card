'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  getStockTransactionTypeColor,
  getStockTransactionTypeLabel,
  STOCK_TRANSACTION_TYPE,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { getStockTransaction } from '@/services';
import type { StockTransaction } from '@/types';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type StockTransactionDetailSheetProps = {
  open: boolean;
  transactionId: number | null;
  onOpenChange: (open: boolean) => void;
};

export function StockTransactionDetailSheet({
  open,
  transactionId,
  onOpenChange,
}: StockTransactionDetailSheetProps) {
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && transactionId) {
      fetchTransaction();
    } else {
      setTransaction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transactionId]);

  const fetchTransaction = async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      const response = await getStockTransaction(transactionId);
      setTransaction(response.data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0">
          <SheetTitle>Chi tiết giao dịch kho</SheetTitle>
          <SheetDescription>{transaction && `Giao dịch #${transaction.id}`}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : transaction ? (
            <div className="space-y-6 py-4">
              {/* Badge trạng thái */}
              <div className="flex items-center gap-2">
                <Badge className={getStockTransactionTypeColor(transaction.type)}>
                  {getStockTransactionTypeLabel(transaction.type)}
                </Badge>
              </div>

              {/* Thông tin giao dịch */}
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Thông tin giao dịch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Sản phẩm</p>
                      <p className="font-medium">{transaction.productName}</p>
                      <p className="text-muted-foreground text-xs">SKU: {transaction.productSku}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Số lượng</p>
                      <p
                        className={`font-medium ${
                          transaction.type === STOCK_TRANSACTION_TYPE.IN
                            ? 'text-green-600'
                            : transaction.type === STOCK_TRANSACTION_TYPE.OUT
                              ? 'text-red-600'
                              : ''
                        }`}
                      >
                        {transaction.type === STOCK_TRANSACTION_TYPE.IN && '+'}
                        {transaction.type === STOCK_TRANSACTION_TYPE.OUT && '-'}
                        {transaction.quantity}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Tồn kho trước</p>
                      <p className="font-medium">{transaction.stockBefore}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Tồn kho sau</p>
                      <p className="font-medium">{transaction.stockAfter}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-muted-foreground text-sm">Người thực hiện</p>
                    <p className="font-medium">{transaction.createdBy}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Ngày tạo</p>
                    <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                  </div>

                  {transaction.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground mb-2 text-sm">Ghi chú</p>
                        <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Không tìm thấy giao dịch</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeImage } from '@/components/ui/safe-image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LowStockProduct } from '@/types';
import { AlertTriangle } from 'lucide-react';

type LowStockProductsTableProps = {
  products: LowStockProduct[];
};

export function LowStockProductsTable({ products }: LowStockProductsTableProps) {
  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-orange-500" />
          Sản phẩm sắp hết hàng
        </CardTitle>
        <CardDescription>Các sản phẩm cần nhập thêm hàng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">Sản phẩm</TableHead>
                <TableHead className="w-[180px] max-w-[200px] min-w-[150px]">Danh mục</TableHead>
                <TableHead className="w-[110px] min-w-[100px] text-right whitespace-nowrap">
                  Tồn kho
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Không có sản phẩm nào sắp hết hàng
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product.productId}>
                    <TableCell className="w-[280px] max-w-[300px] min-w-[200px]">
                      <Link
                        href={`/products/${product.productSlug}`}
                        className="flex items-center gap-3 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SafeImage
                          src={product.productImage}
                          alt={product.productName}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <span className="truncate font-medium" title={product.productName}>
                          {product.productName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="w-[180px] max-w-[200px] min-w-[150px]">
                      <span className="truncate" title={product.categoryName || 'N/A'}>
                        {product.categoryName || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={
                          product.currentStock === 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : product.currentStock <= 5
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }
                      >
                        {product.currentStock} {product.currentStock === 0 && '(Hết hàng)'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

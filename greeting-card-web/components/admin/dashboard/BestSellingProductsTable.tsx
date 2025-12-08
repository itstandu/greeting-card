import Link from 'next/link';
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
import type { BestSellingProduct } from '@/types';

type BestSellingProductsTableProps = {
  products: BestSellingProduct[];
};

export function BestSellingProductsTable({ products }: BestSellingProductsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
        <CardDescription>Top sản phẩm có doanh số cao nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px] max-w-[300px] min-w-[200px]">Sản phẩm</TableHead>
                <TableHead className="w-[110px] min-w-[100px] text-right whitespace-nowrap">
                  Đã bán
                </TableHead>
                <TableHead className="w-[130px] min-w-[120px] text-right whitespace-nowrap">
                  Doanh thu
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Chưa có dữ liệu
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
                    <TableCell className="text-right whitespace-nowrap">
                      {product.totalSold}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatCurrency(product.totalRevenue)}
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

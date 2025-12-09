'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { CategorySales } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type CategorySalesChartProps = {
  data: CategorySales[];
};

const chartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function CategorySalesChart({ data }: CategorySalesChartProps) {
  const router = useRouter();
  const chartData = data.map(item => ({
    name: item.categoryName,
    slug: item.categorySlug,
    revenue: item.revenue,
    orderCount: item.orderCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo danh mục</CardTitle>
        <CardDescription>Tất cả danh mục có doanh thu</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={100}
              tickFormatter={(value: number | string) => formatCurrency(Number(value))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(Number(value)), 'Doanh thu'];
                    }
                    return [value, 'Đơn hàng'];
                  }}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
              maxBarSize={80}
              label={{
                position: 'top',
                formatter: (value: number | string) => {
                  if (typeof value === 'number') {
                    return formatCurrency(value);
                  }
                  return String(value ?? '');
                },
                style: { fontSize: 11, fill: 'hsl(var(--foreground))' },
              }}
              onClick={(data, index) => {
                if (index !== undefined && chartData[index]) {
                  router.push(`/categories/${chartData[index].slug}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

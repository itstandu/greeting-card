'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { RevenueSummary } from '@/types';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type RevenueChartProps = {
  data: RevenueSummary[];
};

const chartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: 'hsl(var(--chart-1))',
  },
  orderCount: {
    label: 'Đơn hàng',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo thời gian</CardTitle>
        <CardDescription>Tổng quan doanh thu trong 30 ngày qua</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => {
                // Format date string
                const date = new Date(value);
                return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCurrency}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    const date = new Date(value);
                    return date.toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(Number(value)), 'Doanh thu'];
                    }
                    return [value, 'Đơn hàng'];
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="url(#fillRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { OrderStatusDistribution } from '@/types';
import { Cell, Pie, PieChart } from 'recharts';

type OrderStatusChartProps = {
  data: OrderStatusDistribution[];
};

const chartConfig = {
  count: {
    label: 'Số lượng',
  },
} satisfies ChartConfig;

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const statusColors: Record<string, string> = {
  PENDING: 'hsl(var(--chart-1))',
  CONFIRMED: 'hsl(var(--chart-2))',
  SHIPPED: 'hsl(var(--chart-3))',
  DELIVERED: 'hsl(var(--chart-4))',
  CANCELLED: 'hsl(var(--destructive))',
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: statusColors[item.status] || COLORS[index % COLORS.length],
  }));

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
        <CardDescription>Tổng quan các trạng thái đơn hàng hiện tại</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => [
                    `${value} đơn hàng `,
                    props.payload.label.toLowerCase(),
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

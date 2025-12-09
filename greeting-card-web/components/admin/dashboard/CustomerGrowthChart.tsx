'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { CustomerGrowth } from '@/types';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

type CustomerGrowthChartProps = {
  data: CustomerGrowth[];
};

const chartConfig = {
  newUsers: {
    label: 'Người dùng mới',
    color: 'hsl(var(--chart-1))',
  },
  totalUsers: {
    label: 'Tổng người dùng',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  const formatDate = (value: string) => {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    } catch {
      return value;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tăng trưởng khách hàng</CardTitle>
        <CardDescription>Số lượng người dùng mới và tổng người dùng theo thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    try {
                      const date = new Date(value);
                      return date.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    } catch {
                      return value;
                    }
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="var(--color-newUsers)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="totalUsers"
              stroke="var(--color-totalUsers)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

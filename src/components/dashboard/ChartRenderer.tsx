'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartRendererProps {
  data: { month: string; totalAmount: number; transactions: number }[];
  formatCurrency: (amount: number) => string;
}

export function ChartRenderer({ data, formatCurrency }: ChartRendererProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Belum ada data pembayaran</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis 
            dataKey="month" 
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Total']}
            labelStyle={{ color: '#000' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Bar 
            dataKey="totalAmount" 
            fill="hsl(var(--chart-1))" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

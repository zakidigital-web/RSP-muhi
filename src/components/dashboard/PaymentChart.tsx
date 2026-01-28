'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { MonthlyPaymentSummary } from '@/lib/types';
import { ChartRenderer } from './ChartRenderer';
import { Skeleton } from '@/components/ui/skeleton';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function PaymentChart() {
  const [data, setData] = useState<{ month: string; totalAmount: number; transactions: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch payments from database API
        const response = await fetch('/api/payments');
        const payments = await response.json();
        
        const currentYear = new Date().getFullYear();

        // Group payments by month for current year
        const monthlyData: { [key: number]: MonthlyPaymentSummary } = {};

        // Initialize all months
        for (let i = 1; i <= 12; i++) {
          monthlyData[i] = {
            month: i,
            year: currentYear,
            totalAmount: 0,
            totalTransactions: 0,
          };
        }

        // Aggregate payments
        payments.forEach((payment: any) => {
          const paymentDate = new Date(payment.payment_date);
          if (paymentDate.getFullYear() === currentYear) {
            const month = paymentDate.getMonth() + 1;
            monthlyData[month].totalAmount += payment.amount;
            monthlyData[month].totalTransactions += 1;
          }
        });

        const chartData = Object.values(monthlyData).map(d => ({
          month: monthNames[d.month - 1],
          totalAmount: d.totalAmount,
          transactions: d.totalTransactions,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Pembayaran</CardTitle>
        <CardDescription>
          Perkembangan pembayaran tahun {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ChartRenderer data={data} formatCurrency={formatCurrency} />
        )}
      </CardContent>
    </Card>
  );
}
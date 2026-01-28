'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalPaymentsThisMonth: 0,
    totalAmountThisMonth: 0,
    totalOutstanding: 0,
    paymentRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);

        // Fetch data from database API
        const [studentsRes, paymentsRes, paymentTypesRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/payments'),
          fetch('/api/payment-types'),
        ]);

        const students = await studentsRes.json();
        const payments = await paymentsRes.json();
        const paymentTypes = await paymentTypesRes.json();

        const activeStudents = students.filter((s: any) => s.status === 'active');
        const sppType = paymentTypes.find((t: any) => t.name === 'SPP');

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Payments this month
        const paymentsThisMonth = payments.filter((p: any) => {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate.getMonth() + 1 === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        });

        const totalAmountThisMonth = paymentsThisMonth.reduce((sum: number, p: any) => sum + p.amount, 0);

        // Calculate outstanding (SPP not paid for current month)
        const sppPaidStudentIds = new Set(
          payments
            .filter((p: any) => p.paymentTypeId === sppType?.id && p.month === currentMonth && p.year === currentYear)
            .map((p: any) => p.studentId)
        );
        
        const studentsNotPaid = activeStudents.filter((s: any) => !sppPaidStudentIds.has(s.id));
        const totalOutstanding = studentsNotPaid.length * (sppType?.amount || 0);

        const paymentRate = activeStudents.length > 0 
          ? (sppPaidStudentIds.size / activeStudents.length) * 100 
          : 0;

        setStats({
          totalStudents: activeStudents.length,
          totalPaymentsThisMonth: paymentsThisMonth.length,
          totalAmountThisMonth,
          totalOutstanding,
          paymentRate,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    {
      title: 'Total Siswa Aktif',
      value: stats.totalStudents.toString(),
      description: 'Siswa terdaftar',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pembayaran Bulan Ini',
      value: formatCurrency(stats.totalAmountThisMonth),
      description: `${stats.totalPaymentsThisMonth} transaksi`,
      icon: CreditCard,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Tingkat Pembayaran',
      value: `${stats.paymentRate.toFixed(1)}%`,
      description: 'SPP bulan ini',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Tunggakan',
      value: formatCurrency(stats.totalOutstanding),
      description: 'SPP belum lunas',
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
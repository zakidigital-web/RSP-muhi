'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function RecentPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentPayments = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from payments API
        const res = await fetch('/api/payments?limit=10');
        const data = await res.json();

        if (Array.isArray(data)) {
          // Sort by date descending
          const sorted = data.sort((a: any, b: any) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          );
          setPayments(sorted);
        }
      } catch (error) {
        console.error('Error loading recent payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentPayments();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pembayaran Terbaru</CardTitle>
          <CardDescription>10 transaksi terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pembayaran Terbaru</CardTitle>
        <CardDescription>10 transaksi terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Belum ada pembayaran
            </p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{payment.studentName || 'Siswa Tidak Diketahui'}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {payment.className || 'N/A'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {payment.paymentTypeName || 'Pembayaran'}
                      {payment.month && ` - Bulan ${payment.month}`}
                    </span>
                  </div>
                </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </p>
                  </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

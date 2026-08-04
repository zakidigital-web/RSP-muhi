'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt } from 'lucide-react';

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

interface ReceiptGroup {
  receiptNumber: string;
  studentName: string;
  studentNis?: string | null;
  className: string;
  itemCount: number;
  total: number;
  typeLabels: string[];
  paymentDate: string;
}

export function RecentPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentPayments = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from payments API (extra rows so aggregation still yields ~10 receipts)
        const res = await fetch('/api/payments?limit=100');
        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = data.sort((a: any, b: any) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          );

          // Aggregate by receipt number: one row per receipt
          const map = new Map<string, any[]>();
          for (const p of sorted) {
            const list = map.get(p.receiptNumber) || [];
            list.push(p);
            map.set(p.receiptNumber, list);
          }

          const groups: ReceiptGroup[] = Array.from(map.entries())
            .map(([receiptNumber, items]) => {
              const sortedItems = items.sort((a: any, b: any) => a.id - b.id);
              const first = sortedItems[0];
              const total = sortedItems.reduce((sum: number, p: any) => sum + p.amount, 0);
              const typeLabels: string[] = [];
              for (const p of sortedItems) {
                const label = p.paymentTypeName
                  ? `${p.paymentTypeName}${p.month ? ` - ${p.month}` : ''}`
                  : 'Pembayaran';
                if (!typeLabels.includes(label)) typeLabels.push(label);
              }
              return {
                receiptNumber,
                studentName: first.studentName || 'Siswa Tidak Diketahui',
                studentNis: first.studentNis,
                className: first.className || 'N/A',
                itemCount: sortedItems.length,
                total,
                typeLabels,
                paymentDate: first.paymentDate,
              };
            })
            .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
            .slice(0, 10);

          setPayments(groups);
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
          <CardDescription>10 kuitansi terakhir</CardDescription>
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
        <CardDescription>10 kuitansi terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Belum ada pembayaran
            </p>
          ) : (
            payments.map((group) => (
              <div
                key={group.receiptNumber}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{group.studentName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {group.className}
                    </Badge>
                    <span className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {group.typeLabels.join(', ')}
                    </span>
                  </div>
                  {group.itemCount > 1 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Receipt className="h-3 w-3" />
                      {group.itemCount} transaksi
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(group.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(group.paymentDate)}
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

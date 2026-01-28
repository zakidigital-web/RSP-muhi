'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, TrendingUp, CreditCard, Users } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MonthlyReport {
  paymentType: string;
  count: number;
  total: number;
}

export function LaporanBulanan() {
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { paymentTypes, isLoading: typesLoading } = usePaymentTypes();
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredPayments = payments.filter(p => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() + 1 === parseInt(selectedMonth) &&
           paymentDate.getFullYear() === parseInt(selectedYear);
  });

  // Group by payment type
  const reportByType: MonthlyReport[] = paymentTypes.map(type => {
    const typePayments = filteredPayments.filter(p => p.paymentTypeId === type.id);
    return {
      paymentType: type.name,
      count: typePayments.length,
      total: typePayments.reduce((sum, p) => sum + p.amount, 0),
    };
  }).filter(r => r.count > 0);

  const totalTransactions = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const uniqueStudents = new Set(filteredPayments.map(p => p.studentId)).size;

  const handleExport = () => {
    const monthName = monthNames[parseInt(selectedMonth) - 1];
    const headers = ['Tanggal', 'No. Kuitansi', 'Nama Siswa', 'Kelas', 'Jenis', 'Metode', 'Jumlah'];
    const csvData = filteredPayments.map(p => [
      new Date(p.paymentDate).toLocaleDateString('id-ID'),
      p.receiptNumber,
      p.studentName,
      p.className,
      p.paymentTypeName,
      p.paymentMethod === 'cash' ? 'Tunai' : p.paymentMethod === 'transfer' ? 'Transfer' : 'Lainnya',
      p.amount,
    ]);
    
    // Add summary
    csvData.push([]);
    csvData.push(['', '', '', '', 'TOTAL', '', totalAmount]);
    
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${monthName}-${selectedYear}.csv`;
    a.click();
    toast.success('Laporan berhasil diexport');
  };

  if (paymentsLoading || typesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Bulanan</h1>
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <LoadingSpinner size="lg" text="Memuat data..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Bulanan</h1>
          <p className="text-muted-foreground">
            Rekap pembayaran per bulan
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((name, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={filteredPayments.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transaksi
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Siswa Membayar
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan per Jenis Pembayaran</CardTitle>
          <CardDescription>
            {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Pembayaran</TableHead>
                    <TableHead className="text-center">Jumlah Transaksi</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportByType.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Tidak ada transaksi pada bulan ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {reportByType.map((item) => (
                        <TableRow key={item.paymentType}>
                          <TableCell className="font-medium">{item.paymentType}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">TOTAL</TableCell>
                        <TableCell className="text-center font-bold">{totalTransactions}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(totalAmount)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Detail Transaksi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                    <TableHead className="whitespace-nowrap">No. Kuitansi</TableHead>
                    <TableHead className="whitespace-nowrap">Siswa</TableHead>
                    <TableHead className="whitespace-nowrap">Kelas</TableHead>
                    <TableHead className="whitespace-nowrap">Jenis</TableHead>
                    <TableHead className="whitespace-nowrap">Metode</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada transaksi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments
                      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {payment.receiptNumber}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{payment.studentName}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary">{payment.className}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{payment.paymentTypeName}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline">
                              {payment.paymentMethod === 'cash' ? 'Tunai' : 
                               payment.paymentMethod === 'transfer' ? 'Transfer' : 'Lainnya'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600 whitespace-nowrap">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
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
import { BookOpen, Download, ChevronLeft, ChevronRight, TrendingUp, CreditCard } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LedgerEntry {
  id: number;
  paymentDate: string;
  receiptNumber: string;
  paymentTypeName: string;
  studentName: string;
  className: string;
  amount: number;
  balance: number;
}

export function BukuBesar() {
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { academicYears, activeYear, isLoading: yearsLoading } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  // Set default academic year
  useMemo(() => {
    if (activeYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(activeYear.id.toString());
    }
  }, [activeYear, selectedAcademicYearId]);

  const isLoading = paymentsLoading || yearsLoading;

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => p.academicYearId.toString() === selectedAcademicYearId)
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }, [payments, selectedAcademicYearId]);

  // Calculate running balance
  const ledgerEntries = useMemo((): LedgerEntry[] => {
    let runningBalance = 0;
    return filteredPayments.map(p => {
      runningBalance += p.amount;
      return {
        id: p.id,
        paymentDate: p.paymentDate,
        receiptNumber: p.receiptNumber,
        paymentTypeName: p.paymentTypeName,
        studentName: p.studentName,
        className: p.className,
        amount: p.amount,
        balance: runningBalance
      };
    });
  }, [filteredPayments]);

  const totalPages = Math.ceil(ledgerEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    return ledgerEntries
      .slice()
      .reverse() // Show newest first in the table but keep balance calculation from start
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [ledgerEntries, currentPage]);

  const totalIncome = useMemo(() => ledgerEntries.reduce((sum, e) => sum + e.amount, 0), [ledgerEntries]);

  // Monthly summary for the selected academic year
  const monthlySummary = useMemo(() => {
    return monthNames.map((name, i) => {
      const monthNum = i + 1;
      const monthPayments = filteredPayments.filter(p => {
        const date = new Date(p.paymentDate);
        return date.getMonth() + 1 === monthNum;
      });
      return {
        month: name,
        count: monthPayments.length,
        total: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      };
    });
  }, [filteredPayments]);

  const handleExport = () => {
    const selectedYearName = academicYears.find(y => y.id.toString() === selectedAcademicYearId)?.name || 'Unknown';
    const headers = ['No', 'Tanggal', 'No. Kuitansi', 'Keterangan', 'Debit', 'Kredit', 'Saldo'];
    const csvData = ledgerEntries.map((entry, i) => [
      i + 1,
      new Date(entry.paymentDate).toLocaleDateString('id-ID'),
      entry.receiptNumber,
      `${entry.paymentTypeName} - ${entry.studentName} (${entry.className})`,
      entry.amount,
      0,
      entry.balance,
    ]);
    
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buku-besar-${selectedYearName.replace('/', '-')}.csv`;
    a.click();
    toast.success('Buku besar berhasil diexport');
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat buku besar..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buku Besar</h1>
          <p className="text-muted-foreground">
            Ledger keuangan lengkap per tahun ajaran
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.name} {year.isActive && '(Aktif)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={ledgerEntries.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Total akumulasi pada periode ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledgerEntries.length}</div>
            <p className="text-xs text-muted-foreground">Jumlah kuitansi yang diterbitkan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {monthlySummary.map((item, i) => (
              <div 
                key={i} 
                className={`rounded-lg border p-3 ${item.total > 0 ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}
              >
                <p className="text-xs font-medium text-muted-foreground">{item.month}</p>
                <p className="text-sm font-bold">{formatCurrency(item.total)}</p>
                <p className="text-[10px] text-muted-foreground">{item.count} transaksi</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Jurnal Transaksi</CardTitle>
          </div>
          <CardDescription>
            Menampilkan transaksi terbaru untuk tahun ajaran yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 whitespace-nowrap">No</TableHead>
                    <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                    <TableHead className="whitespace-nowrap">No. Kuitansi</TableHead>
                    <TableHead className="whitespace-nowrap">Keterangan</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Debit</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Kredit</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada transaksi pada periode ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEntries.map((entry, i) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {ledgerEntries.length - ((currentPage - 1) * itemsPerPage + i)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(entry.paymentDate).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="font-mono text-[10px] whitespace-nowrap">
                          {entry.receiptNumber}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[150px] max-w-[200px]">
                            <p className="font-medium text-sm truncate">{entry.paymentTypeName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {entry.studentName} ({entry.className})
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium text-sm whitespace-nowrap">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">-</TableCell>
                        <TableCell className="text-right font-bold text-sm whitespace-nowrap">
                          {formatCurrency(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

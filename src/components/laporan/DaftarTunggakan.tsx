'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, AlertCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { useClasses } from '@/hooks/useClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const monthValues = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

interface TunggakanItem {
  studentId: number;
  studentName: string;
  studentNis: string;
  className: string;
  parentPhone: string;
  unpaidMonths: number[];
  totalDue: number;
}

export function DaftarTunggakan() {
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { payments, isLoading: isLoadingPayments } = usePayments();
  const { paymentTypes, isLoading: isLoadingTypes } = usePaymentTypes();
  const { classes, isLoading: isLoadingClasses } = useClasses();
  const { activeYear, isLoading: isLoadingYears } = useAcademicYears();

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const isLoading = isLoadingStudents || isLoadingPayments || isLoadingTypes || isLoadingClasses || isLoadingYears;

  const sppType = useMemo(() => 
    paymentTypes.find(t => t.name.toLowerCase() === 'spp' || t.isRecurring),
    [paymentTypes]
  );

  const monthsToCheck = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    
    // In academic calendar starting July, months are: 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6
    // We check up to the current month
    const currentMonthIndex = monthValues.indexOf(currentMonth);
    if (currentMonthIndex === -1) return monthValues; // Fallback
    
    return monthValues.slice(0, currentMonthIndex + 1);
  }, []);

  const tunggakanList = useMemo((): TunggakanItem[] => {
    if (!sppType || !activeYear) return [];

    const activeStudents = students.filter(s => s.status === 'active');

    return activeStudents
      .map(student => {
        const studentPayments = payments.filter(
          p => p.studentId === student.id && 
               p.paymentTypeId === sppType.id &&
               p.academicYearId === activeYear.id &&
               (p.isPaidOff || !p.isInstallment)
        );

        const paidMonths = studentPayments
          .filter(p => p.month !== null)
          .map(p => p.month as number);

        const unpaidMonths = monthsToCheck.filter(m => !paidMonths.includes(m));
        const totalDue = unpaidMonths.length * sppType.amount;

        return {
          studentId: student.id,
          studentName: student.name,
          studentNis: student.nis,
          className: student.className,
          parentPhone: student.parentPhone,
          unpaidMonths,
          totalDue,
        };
      })
      .filter(item => item.unpaidMonths.length > 0)
      .sort((a, b) => b.totalDue - a.totalDue);
  }, [students, payments, sppType, activeYear, monthsToCheck]);

  const filteredList = useMemo(() => {
    return tunggakanList.filter(item => {
      const matchSearch = 
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.studentNis.includes(search);
      
      const student = students.find(s => s.id === item.studentId);
      const matchClass = filterClass === 'all' || student?.classId?.toString() === filterClass;
      
      return matchSearch && matchClass;
    });
  }, [tunggakanList, search, filterClass, students]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalTunggakan = useMemo(() => filteredList.reduce((sum, item) => sum + item.totalDue, 0), [filteredList]);

  const handleExport = () => {
    const headers = ['NIS', 'Nama', 'Kelas', 'Bulan Tunggakan', 'Jumlah Tunggakan'];
    const csvData = filteredList.map(item => [
      item.studentNis,
      item.studentName,
      item.className,
      item.unpaidMonths.map(m => monthNames[m - 1]).join(', '),
      item.totalDue,
    ]);
    
    const csv = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar-tunggakan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data berhasil diexport');
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat data tunggakan..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Tunggakan</h1>
          <p className="text-muted-foreground">
            Siswa yang belum melunasi {sppType?.name || 'SPP'} ({activeYear?.name})
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filteredList.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Siswa Menunggak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{filteredList.length}</div>
            <p className="text-xs text-muted-foreground">Siswa aktif dengan tunggakan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tunggakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalTunggakan)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {sppType?.name || 'SPP'} per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(sppType?.amount || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">Daftar Tunggakan</CardTitle>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau NIS..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select
                value={filterClass}
                onValueChange={(v) => {
                  setFilterClass(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">NIS</TableHead>
                    <TableHead className="whitespace-nowrap">Nama Siswa</TableHead>
                    <TableHead className="whitespace-nowrap">Kelas</TableHead>
                    <TableHead className="whitespace-nowrap">Bulan Tunggakan</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Tidak ada data tunggakan ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedList.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{item.studentNis}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <p className="font-medium text-sm">{item.studentName}</p>
                            <p className="text-[10px] text-muted-foreground">{item.parentPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary" className="text-[10px]">{item.className}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {item.unpaidMonths.map(m => (
                              <Badge key={m} variant="destructive" className="text-[10px] px-1 h-4">
                                {monthNames[m - 1].slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className="font-semibold text-red-600 text-sm">
                            {formatCurrency(item.totalDue)}
                          </span>
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

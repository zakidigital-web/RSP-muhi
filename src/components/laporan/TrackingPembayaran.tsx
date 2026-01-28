'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Search, BarChart3, Check, X, ChevronLeft, ChevronRight, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { useClasses } from '@/hooks/useClasses';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames } from '@/lib/utils/date';
import * as XLSX from 'xlsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const monthValues = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

interface StudentPaymentStatus {
  studentId: number;
  studentName: string;
  studentNis: string;
  className: string;
  paidMonths?: number[];
  unpaidMonths?: number[];
  isPaid?: boolean;
  totalPaid: number;
  totalDue: number;
}

export function TrackingPembayaran() {
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { payments, isLoading: isLoadingPayments } = usePayments();
  const { paymentTypes, isLoading: isLoadingTypes } = usePaymentTypes();
  const { classes, isLoading: isLoadingClasses } = useClasses();
  const { academicYears, activeYear, isLoading: isLoadingYears } = useAcademicYears();

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');

  const itemsPerPage = 15;

  // Set default values when data is loaded
  useEffect(() => {
    if (activeYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(activeYear.id.toString());
    }
  }, [activeYear, selectedAcademicYearId]);

  useEffect(() => {
    if (paymentTypes.length > 0 && !selectedPaymentType) {
      setSelectedPaymentType(paymentTypes[0].id.toString());
    }
  }, [paymentTypes, selectedPaymentType]);

  const isLoading = isLoadingStudents || isLoadingPayments || isLoadingTypes || isLoadingClasses || isLoadingYears;

  const currentPaymentType = useMemo(() => 
    paymentTypes.find(t => t.id.toString() === selectedPaymentType),
    [paymentTypes, selectedPaymentType]
  );

  const selectedAcademicYear = useMemo(() => 
    academicYears.find(y => y.id.toString() === selectedAcademicYearId),
    [academicYears, selectedAcademicYearId]
  );

  const paymentStatuses = useMemo((): StudentPaymentStatus[] => {
    if (!currentPaymentType || !selectedAcademicYear) return [];

    const activeStudents = students.filter(s => s.status === 'active');

    return activeStudents.map(student => {
      const studentPayments = payments.filter(
        p => p.studentId === student.id && 
             p.paymentTypeId === currentPaymentType.id &&
             p.academicYearId === selectedAcademicYear.id
      );

      if (currentPaymentType.isRecurring) {
        const paidMonths = studentPayments
          .filter(p => p.month !== null && (p.isPaidOff || !p.isInstallment))
          .map(p => p.month as number);

        const unpaidMonths = monthValues.filter(m => !paidMonths.includes(m));
        const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = unpaidMonths.length * currentPaymentType.amount;

        return {
          studentId: student.id,
          studentName: student.name,
          studentNis: student.nis,
          className: student.className,
          paidMonths,
          unpaidMonths,
          totalPaid,
          totalDue,
        };
      } else {
        const isPaid = studentPayments.some(p => p.isPaidOff || !p.isInstallment);
        const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = isPaid ? 0 : currentPaymentType.amount;

        return {
          studentId: student.id,
          studentName: student.name,
          studentNis: student.nis,
          className: student.className,
          isPaid,
          totalPaid,
          totalDue,
        };
      }
    });
  }, [students, payments, currentPaymentType, selectedAcademicYear]);

  const filteredStatuses = useMemo(() => {
    return paymentStatuses.filter(status => {
      const matchSearch = 
        status.studentName.toLowerCase().includes(search.toLowerCase()) ||
        status.studentNis.includes(search);
      
      const student = students.find(s => s.id === status.studentId);
      const matchClass = filterClass === 'all' || student?.classId?.toString() === filterClass;
      
      return matchSearch && matchClass;
    });
  }, [paymentStatuses, search, filterClass, students]);

  const totalPages = Math.ceil(filteredStatuses.length / itemsPerPage);
  const paginatedStatuses = filteredStatuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPaid = useMemo(() => filteredStatuses.reduce((sum, s) => sum + s.totalPaid, 0), [filteredStatuses]);
  const totalDue = useMemo(() => filteredStatuses.reduce((sum, s) => sum + s.totalDue, 0), [filteredStatuses]);
  
  const avgPaymentRate = useMemo(() => {
    const totalStudents = filteredStatuses.length;
    if (totalStudents === 0) return 0;
    
    if (currentPaymentType?.isRecurring) {
      return (filteredStatuses.reduce((sum, s) => sum + (s.paidMonths?.length || 0), 0) / (totalStudents * 12)) * 100;
    } else {
      return (filteredStatuses.filter(s => s.isPaid).length / totalStudents) * 100;
    }
  }, [filteredStatuses, currentPaymentType]);

  const handleExportExcel = () => {
    if (!currentPaymentType || !selectedAcademicYear) {
      toast.error('Pilih jenis pembayaran dan tahun ajaran terlebih dahulu');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: RINGKASAN
      const summaryData: any[] = [
        ['LAPORAN TRACKING PEMBAYARAN'],
        ['Tahun Ajaran', selectedAcademicYear.name],
        ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
        ['Total Siswa', filteredStatuses.length],
        [''],
        ['PROGRESS PEMBAYARAN'],
        ['']
      ];

      summaryData.push(['Jenis Pembayaran', 'Tipe', 'Nominal', 'Total Terbayar', 'Total Tunggakan', 'Progress']);
      
      paymentTypes.forEach(type => {
        const typePayments = payments.filter(p => p.paymentTypeId === type.id && p.academicYearId === selectedAcademicYear.id);
        const typeTotalPaid = typePayments.reduce((sum, p) => sum + p.amount, 0);
        
        let progress = '';
        let typeTotalDue = 0;
        
        const activeStudents = students.filter(s => s.status === 'active');
        
        if (type.isRecurring) {
          const totalExpected = activeStudents.length * 12 * type.amount;
          typeTotalDue = totalExpected - typeTotalPaid;
          const paidMonthsCount = typePayments.filter(p => p.month !== null && (p.isPaidOff || !p.isInstallment)).length;
          progress = `${((paidMonthsCount / (activeStudents.length * 12)) * 100).toFixed(1)}%`;
        } else {
          const paidStudentsCount = activeStudents.filter(s => 
            payments.some(p => p.studentId === s.id && p.paymentTypeId === type.id && p.academicYearId === selectedAcademicYear.id && (p.isPaidOff || !p.isInstallment))
          ).length;
          typeTotalDue = (activeStudents.length - paidStudentsCount) * type.amount;
          progress = `${((paidStudentsCount / activeStudents.length) * 100).toFixed(1)}%`;
        }

        summaryData.push([
          type.name,
          type.isRecurring ? 'Bulanan' : 'Sekali Bayar',
          type.amount,
          typeTotalPaid,
          typeTotalDue,
          progress
        ]);
      });

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

      // Sheet 2: Detail per Siswa (Current Payment Type)
      const detailData: any[] = [];
      if (currentPaymentType.isRecurring) {
        detailData.push(['NIS', 'Nama Siswa', 'Kelas', ...monthNames, 'Total Bayar', 'Tunggakan']);
        paymentStatuses.forEach(status => {
          detailData.push([
            status.studentNis,
            status.studentName,
            status.className,
            ...monthValues.map(m => status.paidMonths?.includes(m) ? 'LUNAS' : 'BELUM'),
            status.totalPaid,
            status.totalDue
          ]);
        });
      } else {
        detailData.push(['NIS', 'Nama Siswa', 'Kelas', 'Status', 'Total Bayar', 'Tunggakan']);
        paymentStatuses.forEach(status => {
          detailData.push([
            status.studentNis,
            status.studentName,
            status.className,
            status.isPaid ? 'LUNAS' : 'BELUM',
            status.totalPaid,
            status.totalDue
          ]);
        });
      }
      
      const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Siswa');

      XLSX.writeFile(workbook, `Tracking_Pembayaran_${currentPaymentType.name}_${selectedAcademicYear.name.replace('/', '-')}.xlsx`);
      toast.success('Laporan berhasil diexport');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export laporan');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat data tracking..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tracking Pembayaran</h1>
          <p className="text-muted-foreground">
            Monitor status pembayaran siswa per jenis pembayaran
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedAcademicYearId}
            onValueChange={setSelectedAcademicYearId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.name} {year.isActive && '(Aktif)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportExcel} disabled={!currentPaymentType} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Jenis Pembayaran</label>
            <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name} - {formatCurrency(type.amount)} 
                    {type.isRecurring && ' (Bulanan)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Kelas</label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cari Siswa</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nama atau NIS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {currentPaymentType && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStatuses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Terbayar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tunggakan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tingkat Pelunasan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPaymentRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentPaymentType ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">
                Status Pembayaran: {currentPaymentType.name} ({selectedAcademicYear?.name})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Siswa</TableHead>
                      <TableHead className="whitespace-nowrap">Kelas</TableHead>
                      {currentPaymentType.isRecurring ? (
                        monthNames.map((name, i) => (
                          <TableHead key={i} className="text-center w-12 px-1 whitespace-nowrap">{name.slice(0, 3)}</TableHead>
                        ))
                      ) : (
                        <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                      )}
                      <TableHead className="text-right whitespace-nowrap">Tunggakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStatuses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={currentPaymentType.isRecurring ? 15 : 5} className="text-center py-8 text-muted-foreground">
                          Tidak ada data siswa ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStatuses.map((status) => (
                        <TableRow key={status.studentId}>
                          <TableCell className="sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="max-w-[140px]">
                              <p className="font-medium text-sm truncate">{status.studentName}</p>
                              <p className="text-[10px] text-muted-foreground">{status.studentNis}</p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary" className="text-[10px] px-1">{status.className}</Badge>
                          </TableCell>
                          {currentPaymentType.isRecurring ? (
                            monthValues.map((month, i) => (
                              <TableCell key={i} className="text-center p-1">
                                {status.paidMonths?.includes(month) ? (
                                  <div className="flex justify-center">
                                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                      <Check className="h-3 w-3 text-green-600" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="h-5 w-5 rounded-full bg-red-50 flex items-center justify-center">
                                      <X className="h-3 w-3 text-red-400" />
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                            ))
                          ) : (
                            <TableCell className="text-center whitespace-nowrap">
                              {status.isPaid ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">Lunas</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">Belum</Badge>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-right whitespace-nowrap">
                            {status.totalDue > 0 ? (
                              <span className="text-red-600 font-medium text-xs">
                                {formatCurrency(status.totalDue)}
                              </span>
                            ) : (
                              <span className="text-green-600 text-[10px] font-medium italic">Lunas</span>
                            )}
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
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Silakan pilih jenis pembayaran untuk melihat tracking</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, CreditCard, Check, Printer, AlertCircle } from 'lucide-react';
import { Student, PaymentType, Payment } from '@/lib/types';
import { toast } from 'sonner';
import { ReceiptPrint } from './ReceiptPrint';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useSchoolInfo } from '@/hooks/useSchoolInfo';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames, getAcademicMonths } from '../../lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PaymentForm() {
  const { students, isLoading: studentsLoading, getActiveStudents } = useStudents();
  const { payments, addPayment: savePayment } = usePayments();
  const { paymentTypes, isLoading: typesLoading } = usePaymentTypes();
  const { activeYear } = useAcademicYears();
  const { schoolInfo } = useSchoolInfo();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    paymentTypeId: '',
    month: '',
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'other',
    notes: '',
    isInstallment: false,
    installmentNumber: 1,
    totalInstallments: 1,
    isPaidOff: false,
    originalAmount: 0,
  });

  const activeStudents = getActiveStudents();
  
  const selectedPaymentType = paymentTypes.find(t => t.id.toString() === formData.paymentTypeId);

  const filteredStudents = activeStudents.filter(student => {
    if (!search) return false;
    const searchLower = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.nis.toString().includes(search) ||
      student.nisn.toString().includes(search)
    );
  });

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearch('');
    setShowSearchResults(false);
    setFormData(prev => ({ ...prev, month: '' }));
  };

  const handlePaymentTypeChange = (typeId: string) => {
    const type = paymentTypes.find(t => t.id.toString() === typeId);
    setFormData({
      ...formData,
      paymentTypeId: typeId,
      amount: type?.amount || 0,
      originalAmount: type?.amount || 0,
      month: type?.isRecurring ? formData.month : '',
    });
  };

  const getStudentPaidMonths = (studentId: number, paymentTypeId: number): number[] => {
    if (!activeYear) return [];
    return payments
      .filter(p => 
        p.studentId === studentId && 
        p.paymentTypeId === paymentTypeId && 
        p.academicYearId === activeYear.id &&
        p.month !== undefined && p.month !== null &&
        (p.isPaidOff || !p.isInstallment)
      )
      .map(p => p.month!);
  };

  const getAcademicMonthsList = () => {
    if (!activeYear) return [];
    return getAcademicMonths(activeYear.name, selectedPaymentType?.isRecurring ? {
      fromMonth: selectedPaymentType.fromMonth,
      fromYear: selectedPaymentType.fromYear,
      toMonth: selectedPaymentType.toMonth,
      toYear: selectedPaymentType.toYear
    } : undefined);
  };

  const academicMonths = getAcademicMonthsList();

  const hasNonRecurringPaid = (studentId: number, paymentTypeId: number): boolean => {
    return payments.some(p => 
      p.studentId === studentId && 
      p.paymentTypeId === paymentTypeId && 
      (p.isPaidOff || !p.isInstallment)
    );
  };

  const paidMonths = selectedStudent && selectedPaymentType?.isRecurring 
    ? getStudentPaidMonths(selectedStudent.id, selectedPaymentType.id)
    : [];

  const isNonRecurringPaid = selectedStudent && selectedPaymentType && !selectedPaymentType.isRecurring
    ? hasNonRecurringPaid(selectedStudent.id, selectedPaymentType.id)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    if (!formData.paymentTypeId) {
      toast.error('Pilih jenis pembayaran');
      return;
    }

    if (selectedPaymentType?.isRecurring && !formData.month) {
      toast.error('Pilih bulan pembayaran');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Jumlah pembayaran harus lebih dari 0');
      return;
    }

    if (selectedPaymentType?.isRecurring && formData.month) {
      const monthNum = parseInt(formData.month);
      if (paidMonths.includes(monthNum)) {
        const monthName = academicMonths.find(m => m.month === monthNum)?.name || monthNames[monthNum - 1];
        toast.error(`❌ Pembayaran bulan ${monthName} sudah LUNAS!`);
        return;
      }
    }

    if (!selectedPaymentType?.isRecurring && isNonRecurringPaid && !formData.isInstallment) {
      toast.error(`❌ Pembayaran ${selectedPaymentType?.name} sudah LUNAS!`);
      return;
    }

    if (formData.isInstallment && formData.totalInstallments < 2) {
      toast.error('Cicilan minimal 2x');
      return;
    }

    if (!activeYear) {
      toast.error('Tahun ajaran aktif tidak ditemukan. Sila atur di Pengaturan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const selectedMonthData = academicMonths.find(m => m.month === parseInt(formData.month));
      const paymentYear = selectedPaymentType?.isRecurring && selectedMonthData 
        ? selectedMonthData.year 
        : now.getFullYear();

      const paymentData = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentNis: selectedStudent.nis.toString(),
        className: selectedStudent.className,
        paymentTypeId: parseInt(formData.paymentTypeId),
        paymentTypeName: selectedPaymentType?.name || '',
        amount: formData.amount,
        month: selectedPaymentType?.isRecurring ? parseInt(formData.month) : null,
        year: paymentYear,
        academicYearId: activeYear.id,
        paymentDate: now.toISOString().split('T')[0],
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        isInstallment: formData.isInstallment,
        installmentNumber: formData.isInstallment ? formData.installmentNumber : null,
        totalInstallments: formData.isInstallment ? formData.totalInstallments : null,
        isPaidOff: formData.isPaidOff || !formData.isInstallment,
        originalAmount: formData.isInstallment ? formData.originalAmount : null,
        remainingAmount: formData.isInstallment && !formData.isPaidOff 
          ? formData.originalAmount - formData.amount 
          : null,
      };

      // @ts-ignore - IDs are numbers now
      await savePayment(paymentData);
      
      const latestResponse = await fetch('/api/payments?limit=1&studentId=' + selectedStudent.id);
      const latestData = await latestResponse.json();
      if (latestData && latestData.length > 0) {
        setLastPayment(latestData[0]);
        setShowReceipt(true);
      }
      
      const message = formData.isPaidOff 
        ? '✅ Pembayaran berhasil dicatat dan ditandai LUNAS!' 
        : formData.isInstallment 
          ? `✅ Cicilan ke-${formData.installmentNumber} berhasil dicatat!`
          : '✅ Pembayaran berhasil dicatat!';
      
      toast.success(message);

      setFormData({
        paymentTypeId: '',
        month: '',
        amount: 0,
        paymentMethod: 'cash',
        notes: '',
        isInstallment: false,
        installmentNumber: 1,
        totalInstallments: 1,
        isPaidOff: false,
        originalAmount: 0,
      });
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Gagal menyimpan pembayaran');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (studentsLoading || typesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catat Pembayaran</h1>
          <p className="text-muted-foreground">Input pembayaran siswa baru</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <LoadingSpinner size="lg" text="Memuat data..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catat Pembayaran</h1>
        <p className="text-muted-foreground">
          Input pembayaran siswa baru
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Form Pembayaran
            </CardTitle>
            <CardDescription>Isi data pembayaran siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cari Siswa *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ketik nama, NIS, atau NISN..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                  {showSearchResults && filteredStudents.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
                      {filteredStudents.slice(0, 10).map(student => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                          className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              NIS: {student.nis} | Kelas {student.className}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedStudent && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{selectedStudent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        NIS: {selectedStudent.nis} | Kelas {selectedStudent.className}
                      </p>
                    </div>
                    <Badge variant="secondary">{selectedStudent.className}</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Jenis Pembayaran *</Label>
                <Select
                  value={formData.paymentTypeId}
                  onValueChange={handlePaymentTypeChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} - {formatCurrency(type.amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isNonRecurringPaid && !formData.isInstallment && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600 text-sm">
                    ⚠️ Siswa ini sudah pernah membayar <strong>{selectedPaymentType?.name}</strong> dan statusnya LUNAS.
                  </AlertDescription>
                </Alert>
              )}

              {selectedPaymentType?.isRecurring && (
                <div className="space-y-2">
                  <Label>Bulan Pembayaran *</Label>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData({ ...formData, month: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicMonths.map((m) => {
                          const isPaid = paidMonths.includes(m.month);
                          return (
                            <SelectItem 
                              key={`${m.month}-${m.year}`} 
                              value={m.month.toString()}
                              disabled={isPaid}
                            >
                              <span className="flex items-center gap-2">
                                {m.name} {m.year}
                                {isPaid && (
                                  <Badge variant="default" className="bg-green-500 text-xs">
                                    LUNAS
                                  </Badge>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedStudent && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {academicMonths.map((m) => {
                          const isPaid = paidMonths.includes(m.month);
                          return (
                            <Badge 
                              key={`${m.month}-${m.year}`}
                              variant={isPaid ? "default" : "outline"}
                              className={`text-xs ${isPaid ? 'bg-green-500 hover:bg-green-600' : ''}`}
                            >
                              {m.name.slice(0, 3)}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                </div>
              )}

              {selectedPaymentType?.allowInstallment && (
                <div className="space-y-3 rounded-lg border p-3 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isInstallment"
                      checked={formData.isInstallment}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          isInstallment: checked as boolean,
                          isPaidOff: false 
                        })
                      }
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="isInstallment" className="text-sm font-medium cursor-pointer">
                      💳 Pembayaran Cicilan
                    </Label>
                  </div>

                  {formData.isInstallment && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Cicilan Ke-</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.installmentNumber}
                            onChange={(e) => setFormData({ ...formData, installmentNumber: parseInt(e.target.value) || 1 })}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Dari Total</Label>
                          <Input
                            type="number"
                            min="2"
                            value={formData.totalInstallments}
                            onChange={(e) => setFormData({ ...formData, totalInstallments: parseInt(e.target.value) || 2 })}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Jumlah Bayar *</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  min="0"
                  disabled={isSubmitting}
                />
                {formData.amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.amount)}
                  </p>
                )}
              </div>

              <div className="space-y-2 rounded-lg border p-3 bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPaidOff"
                    checked={formData.isPaidOff}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isPaidOff: checked as boolean })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isPaidOff" className="text-sm font-medium cursor-pointer">
                    ✅ Tandai sebagai LUNAS
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: 'cash' | 'transfer' | 'other') => 
                    setFormData({ ...formData, paymentMethod: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Simpan Pembayaran
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview Kuitansi</CardTitle>
            <CardDescription>Pratinjau bukti pembayaran</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent && formData.paymentTypeId ? (
              <div className="rounded-lg border p-6 space-y-4">
                <div className="text-center border-b pb-4">
                  <h3 className="font-bold text-lg">{schoolInfo?.name || 'SMP Negeri 1'}</h3>
                  <p className="text-sm text-muted-foreground">{schoolInfo?.address || 'Jl. Pendidikan No. 1'}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No. Kuitansi:</span>
                    <span className="font-mono">OTOMATIS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal:</span>
                    <span>{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nama Siswa:</span>
                    <span className="font-medium">{selectedStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NIS:</span>
                    <span>{selectedStudent.nis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kelas:</span>
                    <span>{selectedStudent.className}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jenis Pembayaran:</span>
                    <span>{selectedPaymentType?.name}</span>
                  </div>
                    {selectedPaymentType?.isRecurring && formData.month && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bulan:</span>
                        <span>
                          {academicMonths.find(m => m.month === parseInt(formData.month))?.name}{' '}
                          {academicMonths.find(m => m.month === parseInt(formData.month))?.year}
                        </span>
                      </div>
                    )}
                  {formData.isInstallment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cicilan:</span>
                      <span>Ke-{formData.installmentNumber} dari {formData.totalInstallments}</span>
                    </div>
                  )}
                  {formData.isPaidOff && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className="bg-green-500">LUNAS</Badge>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(formData.amount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Pilih siswa dan jenis pembayaran untuk melihat preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Cetak Kuitansi
            </DialogTitle>
          </DialogHeader>
          {lastPayment && (
            <ReceiptPrint payment={lastPayment} onClose={() => setShowReceipt(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

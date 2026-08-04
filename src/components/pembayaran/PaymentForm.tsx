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
import { Search, CreditCard, Check, Printer, AlertCircle, Layers } from 'lucide-react';
import { Student, PaymentType, Payment } from '@/lib/types';
import { toast } from 'sonner';
import { ReceiptPrint } from './ReceiptPrint';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useSchoolInfo } from '@/hooks/useSchoolInfo';
import { useAuth, getCurrentAdminName } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames, getAcademicMonths } from '../../lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PaymentForm() {
  const { students, isLoading: studentsLoading, getActiveStudents } = useStudents();
  const { payments, addPaymentBatch } = usePayments();
  const { paymentTypes, isLoading: typesLoading } = usePaymentTypes();
  const { activeYear } = useAcademicYears();
  const { schoolInfo } = useSchoolInfo();
  const { adminInfo } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayments, setLastPayments] = useState<Payment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    selectedTypeIds: [] as number[],
    monthsByType: {} as Record<number, number[]>,
    amountByType: {} as Record<number, number>,
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'other',
    notes: '',
    isInstallment: false,
    installmentNumber: 1,
    totalInstallments: 1,
    isPaidOff: false,
    originalAmount: 0,
  });

  const activeStudents = getActiveStudents();

  const selectedPaymentTypes = paymentTypes.filter(t => formData.selectedTypeIds.includes(t.id));
  const recurringTypes = selectedPaymentTypes.filter(t => t.isRecurring);
  const nonRecurringTypes = selectedPaymentTypes.filter(t => !t.isRecurring);
  const isSingleNonRecurring = nonRecurringTypes.length === 1 && recurringTypes.length === 0;

  const filteredStudents = activeStudents.filter(student => {
    if (!search) return false;
    const searchLower = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      (student.nis || '').includes(search) ||
      student.nisn.toString().includes(search)
    );
  });

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearch('');
    setShowSearchResults(false);
    setFormData(prev => ({
      ...prev,
      monthsByType: {},
      amountByType: {},
      isInstallment: false,
      isPaidOff: false,
    }));
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

  const hasNonRecurringPaid = (studentId: number, paymentTypeId: number): boolean => {
    return payments.some(p => 
      p.studentId === studentId && 
      p.paymentTypeId === paymentTypeId && 
      (p.isPaidOff || !p.isInstallment)
    );
  };

  const getAcademicMonthsForType = (type: PaymentType) => {
    if (!activeYear) return [];
    return getAcademicMonths(activeYear.name, type.isRecurring ? {
      fromMonth: type.fromMonth,
      fromYear: type.fromYear,
      toMonth: type.toMonth,
      toYear: type.toYear
    } : undefined);
  };

  const paidMonthsForType = (typeId: number): number[] => {
    return selectedStudent ? getStudentPaidMonths(selectedStudent.id, typeId) : [];
  };

  const toggleType = (typeId: number) => {
    setFormData(prev => {
      const isSelected = prev.selectedTypeIds.includes(typeId);
      const selectedTypeIds = isSelected
        ? prev.selectedTypeIds.filter(id => id !== typeId)
        : [...prev.selectedTypeIds, typeId];
      const monthsByType = { ...prev.monthsByType };
      const amountByType = { ...prev.amountByType };
      if (isSelected) {
        delete monthsByType[typeId];
        delete amountByType[typeId];
      } else {
        const type = paymentTypes.find(t => t.id === typeId);
        if (type) {
          amountByType[typeId] = type.amount || 0;
        }
      }
      return { ...prev, selectedTypeIds, monthsByType, amountByType };
    });
  };

  const toggleMonth = (typeId: number, month: number) => {
    setFormData(prev => {
      const current = prev.monthsByType[typeId] || [];
      const isSelected = current.includes(month);
      const months = isSelected
        ? current.filter(m => m !== month)
        : [...current, month].sort((a, b) => a - b);
      return { ...prev, monthsByType: { ...prev.monthsByType, [typeId]: months } };
    });
  };

  const selectAllMonths = (typeId: number) => {
    const type = paymentTypes.find(t => t.id === typeId);
    if (!type) return;
    const academicMonths = getAcademicMonthsForType(type);
    const paid = paidMonthsForType(typeId);
    const available = academicMonths
      .map(m => m.month)
      .filter(m => !paid.includes(m));
    setFormData(prev => ({
      ...prev,
      monthsByType: { ...prev.monthsByType, [typeId]: available },
    }));
  };

  const clearMonths = (typeId: number) => {
    setFormData(prev => ({
      ...prev,
      monthsByType: { ...prev.monthsByType, [typeId]: [] },
    }));
  };

  const handleAmountChange = (typeId: number, amount: number) => {
    setFormData(prev => ({
      ...prev,
      amountByType: { ...prev.amountByType, [typeId]: amount },
    }));
  };

  const getTypeAmount = (type: PaymentType): number => {
    if (type.isRecurring) {
      return (formData.monthsByType[type.id]?.length || 0) * (formData.amountByType[type.id] || type.amount || 0);
    }
    return formData.amountByType[type.id] || 0;
  };

  const totalAmount = selectedPaymentTypes.reduce((sum, t) => sum + getTypeAmount(t), 0);

  const getMonthsLabel = (type: PaymentType): string => {
    const months = formData.monthsByType[type.id] || [];
    const academicMonths = getAcademicMonthsForType(type);
    if (months.length === 0) return '';
    return months.map(m => {
      const am = academicMonths.find(x => x.month === m);
      return `${am?.name || monthNames[m - 1]} ${am?.year || ''}`;
    }).join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    if (selectedPaymentTypes.length === 0) {
      toast.error('Pilih minimal satu jenis pembayaran');
      return;
    }

    for (const type of recurringTypes) {
      const months = formData.monthsByType[type.id] || [];
      if (months.length === 0) {
        toast.error(`Pilih minimal satu bulan untuk ${type.name}`);
        return;
      }
      const paid = paidMonthsForType(type.id);
      const alreadyPaid = months.filter(m => paid.includes(m));
      if (alreadyPaid.length > 0) {
        const names = alreadyPaid.map(m =>
          getAcademicMonthsForType(type).find(am => am.month === m)?.name || monthNames[m - 1]
        );
        toast.error(`❌ Bulan ${names.join(', ')} (${type.name}) sudah LUNAS!`);
        return;
      }
    }

    for (const type of nonRecurringTypes) {
      const amount = formData.amountByType[type.id] || 0;
      if (amount <= 0) {
        toast.error(`Jumlah pembayaran ${type.name} harus lebih dari 0`);
        return;
      }
      if (hasNonRecurringPaid(selectedStudent.id, type.id) && !formData.isInstallment) {
        toast.error(`❌ Pembayaran ${type.name} sudah LUNAS!`);
        return;
      }
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
      const paymentDate = now.toISOString().split('T')[0];

      const batches: { type: PaymentType; month: number | null }[] = [];
      for (const type of recurringTypes) {
        for (const m of (formData.monthsByType[type.id] || [])) {
          batches.push({ type, month: m });
        }
      }
      for (const type of nonRecurringTypes) {
        batches.push({ type, month: null });
      }

      const createdPayments: Payment[] = [];

      const items: Omit<Payment, 'id' | 'createdAt' | 'receiptNumber'>[] = batches.map(({ type, month }) => {
        const selectedMonthData = month !== null
          ? getAcademicMonthsForType(type).find(am => am.month === month)
          : undefined;

        const paymentYear = month !== null && selectedMonthData
          ? selectedMonthData.year
          : now.getFullYear();

        const amount = type.isRecurring
          ? (formData.amountByType[type.id] || type.amount || 0)
          : (formData.amountByType[type.id] || 0);

        const isInstallmentForType = !type.isRecurring && isSingleNonRecurring && formData.isInstallment;

        return {
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis || '',
          className: selectedStudent.className,
          paymentTypeId: type.id,
          paymentTypeName: type.name,
          amount,
          month: type.isRecurring ? month : null,
          year: paymentYear,
          academicYearId: activeYear.id,
          paymentDate,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          createdBy: adminInfo?.name?.trim() || getCurrentAdminName(),
          isInstallment: isInstallmentForType,
          installmentNumber: isInstallmentForType ? formData.installmentNumber : null,
          totalInstallments: isInstallmentForType ? formData.totalInstallments : null,
          isPaidOff: isInstallmentForType
            ? (formData.isPaidOff || !formData.isInstallment)
            : true,
          originalAmount: isInstallmentForType ? formData.originalAmount : null,
          remainingAmount: isInstallmentForType && !formData.isPaidOff
            ? formData.originalAmount - amount
            : null,
        };
      });

      if (items.length > 0) {
        const created = await addPaymentBatch(items);
        createdPayments.push(...created);
      }

      if (createdPayments.length > 0) {
        setLastPayments(createdPayments);
        setShowReceipt(true);
      }

      const message = createdPayments.length > 1
        ? `✅ ${createdPayments.length} pembayaran berhasil dicatat!`
        : formData.isPaidOff
          ? '✅ Pembayaran berhasil dicatat dan ditandai LUNAS!'
          : formData.isInstallment
            ? `✅ Cicilan ke-${formData.installmentNumber} berhasil dicatat!`
            : '✅ Pembayaran berhasil dicatat!';

      toast.success(message);

      setFormData({
        selectedTypeIds: [],
        monthsByType: {},
        amountByType: {},
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
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan pembayaran';
      toast.error(msg);
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
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Jenis Pembayaran * <span className="text-xs text-muted-foreground">(bisa pilih lebih dari satu)</span>
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {paymentTypes.map(type => {
                    const isSelected = formData.selectedTypeIds.includes(type.id);
                    const isPaid = !type.isRecurring && selectedStudent
                      ? hasNonRecurringPaid(selectedStudent.id, type.id)
                      : false;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleType(type.id)}
                        disabled={isSubmitting}
                        aria-pressed={isSelected}
                        className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        } ${isPaid ? 'opacity-60' : ''}`}
                        title={isPaid ? `${type.name} sudah lunas` : type.name}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-input bg-background'
                          }`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          <span className="text-sm font-medium">{type.name}</span>
                          {isPaid && <span className="text-xs text-green-600">✓ Lunas</span>}
                        </div>
                        <span className="text-sm text-muted-foreground">{formatCurrency(type.amount)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {recurringTypes.map(type => {
                const academicMonths = getAcademicMonthsForType(type);
                const paidMonths = paidMonthsForType(type.id);
                const selectedMonths = formData.monthsByType[type.id] || [];
                const nominal = formData.amountByType[type.id] || type.amount || 0;
                return (
                  <div key={type.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label>{type.name} - Bulan *</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => selectAllMonths(type.id)} disabled={isSubmitting}>
                          Semua
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => clearMonths(type.id)} disabled={isSubmitting}>
                          Bersihkan
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground shrink-0">Nominal / bulan</Label>
                        <Input
                          type="number"
                          min="0"
                          value={nominal || ''}
                          onChange={(e) => handleAmountChange(type.id, parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                          className="w-32 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {academicMonths.map((m) => {
                        const isPaid = paidMonths.includes(m.month);
                        const isSelected = selectedMonths.includes(m.month);
                        return (
                          <Button
                            key={`${type.id}-${m.month}-${m.year}`}
                            type="button"
                            size="sm"
                            variant={isSelected ? 'default' : isPaid ? 'secondary' : 'outline'}
                            onClick={() => toggleMonth(type.id, m.month)}
                            disabled={isPaid || isSubmitting}
                            className={isPaid ? 'opacity-60' : ''}
                            title={isPaid ? `${m.name} ${m.year} (Sudah lunas)` : `${m.name} ${m.year}`}
                          >
                            {m.name.slice(0, 3)}
                            {isPaid && ' ✓'}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedMonths.length > 0
                        ? `${selectedMonths.length} bulan dipilih • Subtotal ${formatCurrency(selectedMonths.length * nominal)}`
                        : 'Klik bulan untuk memilih (bisa lebih dari satu)'}
                    </p>
                  </div>
                );
              })}

              {nonRecurringTypes.map(type => {
                const isPaid = selectedStudent ? hasNonRecurringPaid(selectedStudent.id, type.id) : false;
                const amount = formData.amountByType[type.id] || 0;
                return (
                  <div key={type.id} className="space-y-2 rounded-lg border p-3">
                    <Label>{type.name} *</Label>
                    <Input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => handleAmountChange(type.id, parseInt(e.target.value) || 0)}
                      min="0"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      {amount > 0 ? formatCurrency(amount) : 'Masukkan jumlah pembayaran'}
                    </p>
                    {isPaid && !formData.isInstallment && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-600 text-sm">
                          ⚠️ Siswa ini sudah pernah membayar <strong>{type.name}</strong> dan statusnya LUNAS.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}

              {isSingleNonRecurring && nonRecurringTypes[0]?.allowInstallment && (
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

              {selectedPaymentTypes.length > 0 && !formData.isInstallment && (
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
              )}

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

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || selectedPaymentTypes.length === 0}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Simpan Pembayaran {selectedPaymentTypes.length > 0 && `(${formatCurrency(totalAmount)})`}
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
            {selectedStudent && selectedPaymentTypes.length > 0 ? (
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
                  {selectedPaymentTypes.map(type => {
                    const amount = getTypeAmount(type);
                    const monthsLabel = type.isRecurring ? getMonthsLabel(type) : '';
                    return (
                      <div key={type.id} className="flex justify-between gap-4">
                        <span className="shrink-0">
                          {type.name}
                          {type.isRecurring && monthsLabel && (
                            <span className="block text-xs text-muted-foreground">
                              {formData.monthsByType[type.id]?.length || 0} bulan: {monthsLabel}
                            </span>
                          )}
                        </span>
                        <span className="text-right font-medium">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
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
                    <span className="text-green-600">{formatCurrency(totalAmount)}</span>
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
          {lastPayments.length > 0 && (
            <ReceiptPrint payments={lastPayments} onClose={() => setShowReceipt(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

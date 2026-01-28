'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Check, Zap, AlertCircle } from 'lucide-react';
import { Student, PaymentType } from '@/lib/types';
import { toast } from 'sonner';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames, getAcademicMonths } from '../../lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuickPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickPaymentDialog({ open, onOpenChange }: QuickPaymentDialogProps) {
  const { students, isLoading: studentsLoading, getActiveStudents } = useStudents();
  const { payments, addPayment: savePayment } = usePayments();
  const { paymentTypes, isLoading: typesLoading } = usePaymentTypes();
  const { activeYear } = useAcademicYears();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
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

    const getFilteredAcademicMonths = () => {
      if (!activeYear) return [];
      return getAcademicMonths(activeYear.name, selectedPaymentType?.isRecurring ? {
        fromMonth: selectedPaymentType.fromMonth,
        fromYear: selectedPaymentType.fromYear,
        toMonth: selectedPaymentType.toMonth,
        toYear: selectedPaymentType.toYear
      } : undefined);
    };

  const selectedPaymentType = paymentTypes.find(t => t.id.toString() === formData.paymentTypeId);
  const academicMonths = getFilteredAcademicMonths();
  const paidMonths = selectedStudent && selectedPaymentType?.isRecurring 
    ? getStudentPaidMonths(selectedStudent.id, selectedPaymentType.id)
    : [];

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
      const [monthNum] = formData.month.split('-').map(Number);
      if (paidMonths.includes(monthNum)) {
        toast.error(`Pembayaran bulan ${monthNames[monthNum - 1]} sudah lunas.`);
        return;
      }
    }

    if (!activeYear) {
      toast.error('Tahun ajaran aktif tidak ditemukan');
      return;
    }

    setIsSubmitting(true);

      try {
        const now = new Date();
        const [selectedMonth, selectedYear] = formData.month.split('-').map(Number);
        const paymentYear = selectedPaymentType?.isRecurring && selectedYear 
          ? selectedYear 
          : now.getFullYear();

        const paymentData = {
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis.toString(),
          className: selectedStudent.className,
          paymentTypeId: parseInt(formData.paymentTypeId),
          paymentTypeName: selectedPaymentType?.name || '',
          amount: formData.amount,
          month: selectedPaymentType?.isRecurring ? selectedMonth : null,
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
      
      toast.success('Pembayaran berhasil dicatat!');

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
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal menyimpan pembayaran');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Pencatatan Cepat
          </DialogTitle>
          <DialogDescription>
            Input pembayaran siswa dengan cepat tanpa meninggalkan dashboard
          </DialogDescription>
        </DialogHeader>

        {studentsLoading || typesLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" text="Memuat data..." />
          </div>
        ) : (
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
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
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
              <div className="rounded-lg border bg-muted/50 p-3">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jenis Pembayaran *</Label>
                <Select
                  value={formData.paymentTypeId}
                  onValueChange={handlePaymentTypeChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
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

              {selectedPaymentType?.isRecurring && (
                <div className="space-y-2">
                  <Label>Bulan *</Label>
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
                                value={`${m.month}-${m.year}`}
                                disabled={isPaid}
                              >
                                <span className="flex items-center gap-2">
                                  {m.name} {m.year}
                                  {isPaid && <Check className="h-4 w-4 text-green-500" />}
                                </span>
                              </SelectItem>
                            );
                        })}
                      </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {selectedPaymentType?.allowInstallment && (
              <div className="space-y-3 rounded-lg border p-3 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quickIsInstallment"
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
                  <Label htmlFor="quickIsInstallment" className="text-sm font-medium cursor-pointer">
                    Pembayaran Cicilan
                  </Label>
                </div>

                {formData.isInstallment && (
                  <div className="grid gap-3 sm:grid-cols-2 pl-6">
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
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2">
                <Label>Metode</Label>
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
            </div>

            <div className="space-y-2 rounded-lg border p-3 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quickIsPaidOff"
                  checked={formData.isPaidOff}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isPaidOff: checked as boolean })
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="quickIsPaidOff" className="text-sm font-medium cursor-pointer">
                  ✅ Tandai sebagai LUNAS
                </Label>
              </div>
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

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

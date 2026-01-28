'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Receipt, 
  Printer,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Undo2,
} from 'lucide-react';
import { ReceiptPrint } from './ReceiptPrint';
import { toast } from 'sonner';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

export function PaymentHistory() {
  const { payments, isLoading, deletePayment: removePayment, undoDelete, getTotalAmount } = usePayments();
  const { paymentTypes, isLoading: typesLoading } = usePaymentTypes();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<typeof payments[0] | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<typeof payments[0] | null>(null);
  const [showUndoButton, setShowUndoButton] = useState(false);

  const itemsPerPage = 15;

  const filteredPayments = payments.filter(payment => {
    const matchSearch = 
      payment.studentName.toLowerCase().includes(search.toLowerCase()) ||
      payment.studentNis.toString().includes(search) ||
      payment.receiptNumber.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || payment.paymentTypeId.toString() === filterType;
    const matchMonth = filterMonth === 'all' || 
      (payment.month && payment.month.toString() === filterMonth);
    return matchSearch && matchType && matchMonth;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrint = (payment: typeof payments[0]) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const handleDelete = (payment: typeof payments[0]) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      try {
        await removePayment(paymentToDelete.id);
        toast.success('Pembayaran berhasil dihapus', {
          action: {
            label: 'Undo',
            onClick: handleUndo,
          },
        });
        setShowUndoButton(true);
        setTimeout(() => setShowUndoButton(false), 5000);
      } catch (error) {
        toast.error('Gagal menghapus pembayaran');
      }
    }
    setIsDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  const handleUndo = async () => {
    const restored = await undoDelete();
    if (restored) {
      toast.success('Pembayaran berhasil dikembalikan!');
      setShowUndoButton(false);
    }
  };

  const totalAmount = getTotalAmount(filteredPayments);

  if (isLoading || typesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembayaran</h1>
          <p className="text-muted-foreground">Daftar semua transaksi pembayaran</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembayaran</h1>
          <p className="text-muted-foreground">
            Daftar semua transaksi pembayaran
          </p>
        </div>
        {showUndoButton && (
          <Button onClick={handleUndo} variant="outline" className="gap-2">
            <Undo2 className="h-4 w-4" />
            Kembalikan Transaksi
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">
                  {filteredPayments.length} transaksi
                </CardTitle>
                <CardDescription>
                  Total: {formatCurrency(totalAmount)}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIS, no. kuitansi..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select 
                value={filterType} 
                onValueChange={(value) => {
                  setFilterType(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {paymentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={filterMonth} 
                onValueChange={(value) => {
                  setFilterMonth(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedPayments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={search || filterType !== 'all' || filterMonth !== 'all' ? 'Tidak ada hasil' : 'Belum ada pembayaran'}
              description={search || filterType !== 'all' || filterMonth !== 'all' 
                ? 'Coba ubah filter pencarian Anda' 
                : 'Belum ada transaksi pembayaran yang tercatat'}
            />
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Kuitansi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Bulan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">
                          {payment.receiptNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.studentName}</p>
                            <p className="text-xs text-muted-foreground">{payment.studentNis}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{payment.className}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{payment.paymentTypeName}</p>
                            {payment.isInstallment && (
                              <p className="text-xs text-muted-foreground">
                                Cicilan {payment.installmentNumber}/{payment.totalInstallments}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.month ? monthNames[payment.month - 1] : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.isPaidOff ? (
                            <Badge className="bg-green-500">LUNAS</Badge>
                          ) : payment.isInstallment ? (
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                              Cicilan
                            </Badge>
                          ) : (
                            <Badge variant="default">Lunas</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </p>
                            {payment.isInstallment && payment.remainingAmount && payment.remainingAmount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Sisa: {formatCurrency(payment.remainingAmount)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePrint(payment)}
                              title="Cetak kuitansi"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(payment)}
                              title="Hapus pembayaran"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages} • Menampilkan {paginatedPayments.length} dari {filteredPayments.length} transaksi
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Cetak Kuitansi
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <ReceiptPrint payment={selectedPayment} onClose={() => setShowReceipt(false)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pembayaran ini? Anda dapat mengembalikan transaksi dengan tombol Undo setelah menghapus.
              <br /><br />
              <strong>No. Kuitansi: {paymentToDelete?.receiptNumber}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

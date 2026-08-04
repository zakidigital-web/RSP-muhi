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
  Columns3,
  ChevronsDown,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ReceiptPrint } from './ReceiptPrint';
import { Payment } from '@/lib/types';
import { toast } from 'sonner';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { formatCurrency } from '@/lib/utils/currency';
import { monthNames } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface ReceiptGroup {
  receiptNumber: string;
  payments: Payment[];
}

export function PaymentHistory() {
  const { payments, isLoading, deletePaymentBatch, undoDelete } = usePayments();
  const { paymentTypes, isLoading: typesLoading } = usePaymentTypes();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<ReceiptGroup | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ReceiptGroup | null>(null);
  const [showUndoButton, setShowUndoButton] = useState(false);

  const [columns, setColumns] = useState({
    receiptNumber: true,
    date: true,
    student: true,
    className: true,
    paymentType: true,
    month: true,
    method: true,
    notes: true,
    status: true,
    amount: true,
    createdBy: true,
  });

  const columnLabels: Record<string, string> = {
    receiptNumber: 'No. Kuitansi',
    date: 'Tanggal',
    student: 'Siswa',
    className: 'Kelas',
    paymentType: 'Jenis Bayar',
    month: 'Bulan',
    method: 'Metode',
    notes: 'Catatan',
    status: 'Status',
    amount: 'Jumlah',
    createdBy: 'Petugas',
  };

  const itemsPerPage = 15;

  const groups = useMemo<ReceiptGroup[]>(() => {
    const map = new Map<string, Payment[]>();
    for (const p of payments) {
      const list = map.get(p.receiptNumber) || [];
      list.push(p);
      map.set(p.receiptNumber, list);
    }
    return Array.from(map.entries())
      .map(([receiptNumber, items]) => ({
        receiptNumber,
        payments: items.sort((a, b) => a.id - b.id),
      }))
      .sort((a, b) => {
        const aDate = new Date(a.payments[0].paymentDate).getTime();
        const bDate = new Date(b.payments[0].paymentDate).getTime();
        if (bDate !== aDate) return bDate - aDate;
        return b.payments[0].id - a.payments[0].id;
      });
  }, [payments]);

  const itemLabel = (p: Payment): string =>
    `${p.paymentTypeName}${p.month ? ` - ${monthNames[p.month - 1]} ${p.year}` : ''}`;

  const filteredGroups = groups.filter(group => {
    const matchSearch =
      group.payments.some(p =>
        p.studentName.toLowerCase().includes(search.toLowerCase()) ||
        (p.studentNis || '').includes(search) ||
        p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
        (p.paymentMethod || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.createdBy || '').toLowerCase().includes(search.toLowerCase())
      );
    const matchType = filterType === 'all' ||
      group.payments.some(p => p.paymentTypeId.toString() === filterType);
    const matchMonth = filterMonth === 'all' ||
      group.payments.some(p => p.month && p.month.toString() === filterMonth);
    return matchSearch && matchType && matchMonth;
  });

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalAmount = filteredGroups.reduce((sum, g) => sum + g.payments.reduce((s, p) => s + p.amount, 0), 0);

  const handlePrint = (group: ReceiptGroup) => {
    setSelectedGroup(group);
    setShowReceipt(true);
  };

  const handleDelete = (group: ReceiptGroup) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      try {
        await deletePaymentBatch(groupToDelete.receiptNumber);
        toast.success('Kuitansi berhasil dihapus', {
          action: {
            label: 'Undo',
            onClick: handleUndo,
          },
        });
        setShowUndoButton(true);
        setTimeout(() => setShowUndoButton(false), 5000);
      } catch (error) {
        toast.error('Gagal menghapus kuitansi');
      }
    }
    setIsDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const handleUndo = async () => {
    const restored = await undoDelete();
    if (restored) {
      toast.success('Pembayaran berhasil dikembalikan!');
      setShowUndoButton(false);
    }
  };

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
            Daftar semua kuitansi pembayaran (1 baris = 1 kuitansi)
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
                  {filteredGroups.length} kuitansi
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
                  placeholder="Cari nama, NIS, kuitansi, petugas..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Columns3 className="h-4 w-4" />
                    Kolom
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tampilkan Kolom</p>
                    <div className="space-y-1.5">
                      {(Object.keys(columns) as Array<keyof typeof columns>).map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={columns[key]}
                            onCheckedChange={(checked) =>
                              setColumns((prev) => ({ ...prev, [key]: !!checked }))
                            }
                          />
                          {columnLabels[key]}
                        </label>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
          {paginatedGroups.length === 0 ? (
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
                      {columns.receiptNumber && <TableHead>No. Kuitansi</TableHead>}
                      {columns.date && <TableHead>Tanggal</TableHead>}
                      {columns.student && <TableHead>Siswa</TableHead>}
                      {columns.className && <TableHead>Kelas</TableHead>}
                      {columns.paymentType && <TableHead>Jenis</TableHead>}
                      {columns.month && <TableHead>Bulan</TableHead>}
                      {columns.method && <TableHead>Metode</TableHead>}
                      {columns.notes && <TableHead>Catatan</TableHead>}
                      {columns.status && <TableHead>Status</TableHead>}
                      {columns.createdBy && <TableHead>Petugas</TableHead>}
                      {columns.amount && <TableHead className="text-right">Jumlah</TableHead>}
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGroups.map((group) => {
                      const first = group.payments[0];
                      const total = group.payments.reduce((s, p) => s + p.amount, 0);
                      const typeLabel = group.payments.map(itemLabel).join(', ');
                      const months = group.payments
                        .map(p => p.month)
                        .filter((m): m is number => m !== undefined && m !== null);
                      const allPaidOff = group.payments.every(p => p.isPaidOff);
                      const anyInstallment = group.payments.some(p => p.isInstallment);
                      return (
                        <TableRow key={group.receiptNumber}>
                          {columns.receiptNumber && (
                            <TableCell className="font-mono text-xs">
                              {group.receiptNumber}
                            </TableCell>
                          )}
                          {columns.date && (
                            <TableCell>
                              {new Date(first.paymentDate).toLocaleDateString('id-ID')}
                            </TableCell>
                          )}
                          {columns.student && (
                            <TableCell>
                              <div>
                                <p className="font-medium">{first.studentName}</p>
                                <p className="text-xs text-muted-foreground">{first.studentNis}</p>
                              </div>
                            </TableCell>
                          )}
                          {columns.className && (
                            <TableCell>
                              <Badge variant="secondary">{first.className}</Badge>
                            </TableCell>
                          )}
                          {columns.paymentType && (
                            <TableCell>
                              <div>
                                <p
                                  className="text-sm max-w-[220px] truncate block"
                                  title={typeLabel}
                                >
                                  {typeLabel}
                                </p>
                                {group.payments.length > 1 && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ChevronsDown className="h-3 w-3" />
                                    {group.payments.length} item
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          )}
                          {columns.month && (
                            <TableCell>
                              {months.length > 0
                                ? months.map(m => monthNames[m - 1]).join(', ')
                                : '-'}
                            </TableCell>
                          )}
                          {columns.method && (
                            <TableCell>
                              <span className="text-sm">
                                {first.paymentMethod === 'cash' ? 'Tunai' :
                                 first.paymentMethod === 'transfer' ? 'Transfer' : 'Lainnya'}
                              </span>
                            </TableCell>
                          )}
                          {columns.notes && (
                            <TableCell>
                              <span className="text-sm text-muted-foreground max-w-[120px] truncate block" title={first.notes || ''}>
                                {first.notes || '-'}
                              </span>
                            </TableCell>
                          )}
                          {columns.status && (
                            <TableCell>
                              {allPaidOff ? (
                                <Badge className="bg-green-500">LUNAS</Badge>
                              ) : anyInstallment ? (
                                <Badge variant="outline" className="border-blue-500 text-blue-500">
                                  Cicilan
                                </Badge>
                              ) : (
                                <Badge variant="default">Lunas</Badge>
                              )}
                            </TableCell>
                          )}
                          {columns.createdBy && (
                            <TableCell>
                              <span className="text-sm">{first.createdBy || '-'}</span>
                            </TableCell>
                          )}
                          {columns.amount && (
                            <TableCell className="text-right">
                              <div>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(total)}
                                </p>
                                {group.payments.length > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    {group.payments.length} transaksi
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePrint(group)}
                                title="Cetak kuitansi"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(group)}
                                title="Hapus kuitansi"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages} • Menampilkan {paginatedGroups.length} dari {filteredGroups.length} kuitansi
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Cetak Kuitansi
            </DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <ReceiptPrint payments={selectedGroup.payments} onClose={() => setShowReceipt(false)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kuitansi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kuitansi ini beserta semua transaksinya? Anda dapat mengembalikan transaksi dengan tombol Undo setelah menghapus.
              <br /><br />
              <strong>No. Kuitansi: {groupToDelete?.receiptNumber}</strong>
              {groupToDelete && groupToDelete.payments.length > 1 && (
                <><br /><strong>{groupToDelete.payments.length} transaksi</strong></>
              )}
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

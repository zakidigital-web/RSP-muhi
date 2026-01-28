'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, CreditCard, RefreshCw, Wallet, Calendar } from 'lucide-react';
import { usePaymentTypes } from '@/hooks/usePaymentTypes';
import { PaymentType } from '@/lib/types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { monthNames } from '@/lib/utils/date';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function JenisPembayaran() {
  const { 
    paymentTypes, 
    isLoading, 
    addPaymentType, 
    updatePaymentType, 
    deletePaymentType 
  } = usePaymentTypes();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<PaymentType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<PaymentType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    isRecurring: false,
    allowInstallment: false,
    description: '',
    fromMonth: '',
    fromYear: '',
    toMonth: '',
    toYear: '',
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Nama jenis pembayaran wajib diisi');
      return;
    }

    if (!formData.amount || parseInt(formData.amount) <= 0) {
      toast.error('Nominal harus lebih dari 0');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        amount: parseInt(formData.amount),
        isRecurring: formData.isRecurring,
        allowInstallment: formData.allowInstallment,
        description: formData.description || null,
        fromMonth: formData.fromMonth ? parseInt(formData.fromMonth) : null,
        fromYear: formData.fromYear ? parseInt(formData.fromYear) : null,
        toMonth: formData.toMonth ? parseInt(formData.toMonth) : null,
        toYear: formData.toYear ? parseInt(formData.toYear) : null,
      };

      if (editingType) {
        await updatePaymentType(editingType.id, payload);
        toast.success('Jenis pembayaran berhasil diperbarui');
      } else {
        await addPaymentType(payload);
        toast.success('Jenis pembayaran berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving payment type:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan jenis pembayaran');
    }
  };

  const handleEdit = (type: PaymentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      amount: type.amount.toString(),
      isRecurring: type.isRecurring,
      allowInstallment: type.allowInstallment || false,
      description: type.description || '',
      fromMonth: type.fromMonth?.toString() || '',
      fromYear: type.fromYear?.toString() || '',
      toMonth: type.toMonth?.toString() || '',
      toYear: type.toYear?.toString() || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (type: PaymentType) => {
    setTypeToDelete(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (typeToDelete) {
      try {
        await deletePaymentType(typeToDelete.id);
        toast.success('Jenis pembayaran berhasil dihapus');
      } catch (error) {
        console.error('Error deleting payment type:', error);
        toast.error('Gagal menghapus jenis pembayaran');
      }
    }
    setIsDeleteDialogOpen(false);
    setTypeToDelete(null);
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingType(null);
    setFormData({
      name: '',
      amount: '',
      isRecurring: false,
      allowInstallment: false,
      description: '',
      fromMonth: '',
      fromYear: '',
      toMonth: '',
      toYear: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recurringTypes = paymentTypes.filter(t => t.isRecurring);
  const oneTimeTypes = paymentTypes.filter(t => !t.isRecurring);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jenis Pembayaran</h1>
          <p className="text-muted-foreground">
            Kelola jenis-jenis pembayaran sekolah
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jenis
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pembayaran Berulang
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringTypes.length}</div>
            <p className="text-xs text-muted-foreground">SPP dan sejenisnya</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pembayaran Sekali
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oneTimeTypes.length}</div>
            <p className="text-xs text-muted-foreground">Buku, seragam, dll</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jenis Pembayaran</CardTitle>
          <CardDescription>
            Semua jenis pembayaran yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Cicilan</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data jenis pembayaran
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(type.amount)}
                      </TableCell>
                      <TableCell>
                        {type.isRecurring ? (
                          <Badge variant="default" className="bg-blue-500">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Berulang
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Sekali
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {type.allowInstallment ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Wallet className="mr-1 h-3 w-3" />
                            Bisa Cicil
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Tidak</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {type.fromMonth && type.fromYear ? (
                          <div className="text-xs space-y-1">
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {monthNames[type.fromMonth - 1]} {type.fromYear}
                            </p>
                            {type.toMonth && type.toYear && (
                              <p className="pl-4 text-muted-foreground">
                                s/d {monthNames[type.toMonth - 1]} {type.toYear}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(type)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(type)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
  
        <Dialog open={isFormOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Edit Jenis Pembayaran' : 'Tambah Jenis Pembayaran'}
              </DialogTitle>
              <DialogDescription>
                {editingType ? 'Perbarui data jenis pembayaran' : 'Buat jenis pembayaran baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: SPP, Buku Paket, Seragam"
                />
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal (Rp) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="150000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="isRecurring" className="text-xs">Berulang</Label>
                    <p className="text-[10px] text-muted-foreground">Contoh: SPP</p>
                  </div>
                  <Switch
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowInstallment" className="text-xs">Bisa Cicil</Label>
                    <p className="text-[10px] text-muted-foreground">Dicicil berkala</p>
                  </div>
                  <Switch
                    id="allowInstallment"
                    checked={formData.allowInstallment}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowInstallment: checked })}
                  />
                </div>
              </div>

              <div className="space-y-3 p-3 border rounded-lg bg-slate-50">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Periode Pembayaran (Opsional)
                </Label>
                
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">Mulai dari:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={formData.fromMonth} onValueChange={(v) => setFormData({ ...formData, fromMonth: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((name, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={formData.fromYear} onValueChange={(v) => setFormData({ ...formData, fromYear: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">Sampai dengan:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={formData.toMonth} onValueChange={(v) => setFormData({ ...formData, toMonth: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((name, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={formData.toYear} onValueChange={(v) => setFormData({ ...formData, toYear: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(formData.fromMonth || formData.fromYear || formData.toMonth || formData.toYear) && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-6 w-full text-[10px] text-destructive"
                    onClick={() => setFormData({ ...formData, fromMonth: '', fromYear: '', toMonth: '', toYear: '' })}
                  >
                    Reset Periode
                  </Button>
                )}
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan tentang jenis pembayaran ini"
                  rows={2}
                />
              </div>
  
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingType ? 'Simpan' : 'Tambah'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Jenis Pembayaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus jenis pembayaran "{typeToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

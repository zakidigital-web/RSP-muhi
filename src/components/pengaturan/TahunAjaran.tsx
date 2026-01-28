'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Calendar, CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { useAcademicYear } from '@/hooks/useAcademicYearContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function TahunAjaran() {
  const {
    academicYears,
    activeYear,
    isLoading,
    addAcademicYear,
    setActiveAcademicYear,
  } = useAcademicYear();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Nama tahun ajaran wajib diisi');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Tanggal mulai dan selesai wajib diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      await addAcademicYear({
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: academicYears.length === 0, // First one is active
      });
      
      toast.success('Tahun ajaran berhasil ditambahkan');
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan tahun ajaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (yearId: number, yearName: string) => {
    try {
      await setActiveAcademicYear(yearId);
      toast.success(`Tahun ajaran ${yearName} diaktifkan`);
    } catch (error) {
      toast.error('Gagal mengaktifkan tahun ajaran');
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tahun Ajaran</h1>
          <p className="text-muted-foreground">Kelola periode tahun ajaran</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <LoadingSpinner size="lg" text="Memuat data tahun ajaran..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tahun Ajaran</h1>
          <p className="text-muted-foreground">
            Kelola periode tahun ajaran
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tahun Ajaran
        </Button>
      </div>

      {/* Active Year Card */}
      {activeYear && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Tahun Ajaran Aktif</CardTitle>
              </div>
              <Badge className="bg-green-600">Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-green-700">Nama</p>
                <p className="text-2xl font-bold text-green-800">{activeYear.name}</p>
              </div>
              <div>
                <p className="text-sm text-green-700">Mulai</p>
                <p className="font-medium text-green-800">
                  {new Date(activeYear.startDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Selesai</p>
                <p className="font-medium text-green-800">
                  {new Date(activeYear.endDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Years Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Daftar Tahun Ajaran</CardTitle>
          </div>
          <CardDescription>
            Semua tahun ajaran yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicYears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data tahun ajaran
                    </TableCell>
                  </TableRow>
                ) : (
                  academicYears
                    .sort((a, b) => b.name.localeCompare(a.name))
                    .map((year) => (
                      <TableRow key={year.id}>
                        <TableCell>
                          {year.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {year.name}
                          {year.isActive && (
                            <Badge className="ml-2 bg-green-500">Aktif</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(year.startDate).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          {new Date(year.endDate).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          {!year.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetActive(year.id, year.name)}
                            >
                              Aktifkan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isFormOpen} onOpenChange={resetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
            <DialogDescription>
              Buat tahun ajaran baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tahun Ajaran *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: 2024/2025"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  'Tambah'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
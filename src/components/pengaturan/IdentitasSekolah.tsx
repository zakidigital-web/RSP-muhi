'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, Save } from 'lucide-react';
import { useSchoolInfo } from '@/hooks/useSchoolInfo';
import { SchoolInfo } from '@/lib/types';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function IdentitasSekolah() {
  const { schoolInfo, isLoading, updateSchoolInfo } = useSchoolInfo();
  const [formData, setFormData] = useState<SchoolInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    npsn: '',
  });

  useEffect(() => {
    if (schoolInfo) {
      setFormData(schoolInfo);
    }
  }, [schoolInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Nama sekolah wajib diisi');
      return;
    }

    try {
      await updateSchoolInfo(formData);
      toast.success('Identitas sekolah berhasil disimpan');
    } catch (error) {
      console.error('Error saving school info:', error);
      toast.error('Gagal menyimpan identitas sekolah');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Identitas Sekolah</h1>
        <p className="text-muted-foreground">
          Pengaturan informasi sekolah untuk kuitansi
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Data Sekolah</CardTitle>
            </div>
            <CardDescription>
              Informasi ini akan ditampilkan pada kuitansi pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Sekolah *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="SMP Negeri 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="npsn">NPSN</Label>
                <Input
                  id="npsn"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  placeholder="12345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap sekolah"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="021-12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@sekolah.sch.id"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalName">Nama Kepala Sekolah</Label>
                <Input
                  id="principalName"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="Drs. Ahmad Sudirman, M.Pd"
                />
              </div>

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Kuitansi</CardTitle>
            <CardDescription>
              Tampilan header pada kuitansi pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 bg-white">
              <div className="text-center space-y-2 border-b pb-4">
                <h2 className="text-xl font-bold">{formData.name || 'Nama Sekolah'}</h2>
                <p className="text-sm text-muted-foreground">
                  {formData.address || 'Alamat Sekolah'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.phone && `Telp: ${formData.phone}`}
                  {formData.phone && formData.email && ' | '}
                  {formData.email && `Email: ${formData.email}`}
                </p>
                {formData.npsn && (
                  <p className="text-xs text-muted-foreground">
                    NPSN: {formData.npsn}
                  </p>
                )}
              </div>
              
              <div className="text-center pt-4">
                <h3 className="font-semibold underline">KUITANSI PEMBAYARAN</h3>
                <p className="text-sm text-muted-foreground mt-1">No: KWT/202412/XXXXXX</p>
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Siswa:</span>
                  <span>Ahmad Pratama</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NIS:</span>
                  <span>20240001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kelas:</span>
                  <span>7A</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">Rp 150.000</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-right text-sm">
                <p>Mengetahui,</p>
                <p className="mt-8">{formData.principalName || 'Kepala Sekolah'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

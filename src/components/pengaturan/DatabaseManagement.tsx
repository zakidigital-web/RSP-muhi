'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  FileJson,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDatabase } from '@/hooks/useDatabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DatabaseManagement() {
  const {
    exportDatabase,
    importDatabase,
    resetDatabase,
    isExporting,
    isImporting,
    isResetting,
  } = useDatabase();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    await exportDatabase();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = await importDatabase(content);
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    const result = await resetDatabase();
    if (result.success) {
      setIsResetDialogOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Database</h1>
        <p className="text-muted-foreground">
          Backup, restore, dan kelola data aplikasi
        </p>
      </div>

      {/* Database Status Info */}
      <Alert className="border-green-200 bg-green-50/50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Database Aktif!</strong> Semua data otomatis tersimpan di database cloud. 
          Tidak perlu sinkronisasi manual - data Anda selalu aman.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              <CardTitle>Backup Database</CardTitle>
            </div>
            <CardDescription>
              Download backup semua data dalam format JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              File backup akan berisi:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Data siswa & kelas</li>
              <li>Jenis pembayaran</li>
              <li>Riwayat pembayaran lengkap</li>
              <li>Tahun ajaran</li>
              <li>Identitas sekolah</li>
            </ul>
            <Button 
              onClick={handleExport} 
              className="w-full"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Membuat backup...
                </>
              ) : (
                <>
                  <FileJson className="mr-2 h-4 w-4" />
                  Download Backup
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              💡 Disarankan backup rutin setiap minggu
            </p>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              <CardTitle>Restore Database</CardTitle>
            </div>
            <CardDescription>
              Restore data dari file backup JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Pilih file JSON backup
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
                disabled={isImporting}
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Mengimport...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Pilih File Backup
                </>
              )}
            </Button>
            <p className="text-xs text-red-500 text-center">
              ⚠️ Restore akan menimpa semua data yang ada
            </p>
          </CardContent>
        </Card>

        {/* Reset Card - Full width */}
        <Card className="border-red-200 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-600">Reset Database</CardTitle>
            </div>
            <CardDescription>
              Hapus semua data dari database dan storage lokal secara permanen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Peringatan!</p>
                  <p>
                    Tindakan ini akan menghapus SEMUA data secara permanen:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Database Cloud:</strong> Semua data siswa, kelas, pembayaran, tahun ajaran</li>
                    <li><strong>Storage Lokal (Browser):</strong> localStorage dan sessionStorage</li>
                    <li><strong>Riwayat Pembayaran:</strong> Semua transaksi dan history</li>
                    <li><strong>Riwayat Kelas:</strong> Data kelas dan tahun ajaran</li>
                  </ul>
                  <p className="mt-2 font-medium">Aplikasi akan bersih tanpa data apapun!</p>
                  <p className="mt-1 text-xs">💡 Pastikan backup terlebih dahulu sebelum reset!</p>
                </div>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setIsResetDialogOpen(true)}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset Database & Storage Lokal
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Informasi Penyimpanan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipe Database:</span>
              <span className="font-medium">Turso Database (LibSQL)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-green-600">✓ Online & Aktif</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lokasi Server:</span>
              <span className="font-medium">Cloud (AWS US-West-2)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mode Penyimpanan:</span>
              <span className="font-medium text-blue-600">✓ Auto-Save</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage Lokal:</span>
              <span className="font-medium">localStorage + sessionStorage</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
              💡 <strong>Database Auto-Save:</strong> Semua perubahan data langsung tersimpan ke database cloud. 
              Data aman dari kehilangan, dapat diakses dari device berbeda, dan tidak terpengaruh cache browser.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              🧹 <strong>Reset Lengkap:</strong> Fitur reset akan menghapus data dari database cloud DAN 
              semua storage lokal browser (localStorage & sessionStorage) untuk memastikan aplikasi benar-benar bersih.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Reset Database
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.</p>
              
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <p className="font-medium mb-2">Yang akan dihapus:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Database cloud (siswa, kelas, pembayaran)</li>
                  <li>Riwayat pembayaran lengkap</li>
                  <li>Riwayat kelas dan tahun ajaran</li>
                  <li>localStorage browser</li>
                  <li>sessionStorage browser</li>
                </ul>
              </div>
              
              <p className="text-sm font-medium">Pastikan Anda sudah membuat backup sebelum melanjutkan!</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isResetting}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menghapus...
                </>
              ) : (
                'Ya, Hapus Semua Data'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
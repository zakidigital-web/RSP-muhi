'use client';

import { 
  BookOpen, 
  Settings, 
  Users, 
  CreditCard, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Trash2,
  Database,
  Printer,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function PetunjukPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-8 px-4 pb-24 lg:pb-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Petunjuk Penggunaan</h1>
            <p className="text-muted-foreground">Panduan lengkap langkah demi langkah menggunakan sistem SPP.</p>
          </div>
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Lightbulb className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold">Tips Cepat</AlertTitle>
        <AlertDescription>
          Gunakan tombol <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 px-1 py-0 h-5">⚡ Pencatatan Cepat</Badge> di Dashboard untuk menginput pembayaran tanpa pindah halaman!
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Zap className="h-5 w-5 text-primary" />
              <h2>Alur Kerja Sistem (5 Langkah Mudah)</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="step-1" className="border rounded-xl px-4 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
                    <div>
                      <div className="font-bold">Persiapan Awal</div>
                      <div className="text-sm font-normal text-muted-foreground text-balance">Atur identitas sekolah, tahun ajaran, dan jenis pembayaran.</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2 space-y-4">
                  <div className="grid gap-4 ml-12">
                    <div className="space-y-2">
                      <p className="font-medium flex items-center gap-2"><Settings className="h-4 w-4" /> A. Identitas Sekolah</p>
                      <p className="text-sm text-muted-foreground">Isi data sekolah di menu <strong>Pengaturan → Identitas</strong>. Data ini akan muncul di kuitansi dan laporan.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="font-medium flex items-center gap-2"><Settings className="h-4 w-4" /> B. Tahun Ajaran</p>
                      <p className="text-sm text-muted-foreground">Buat tahun ajaran baru (misal: 2024/2025) dan pastikan statusnya <strong>Aktif</strong>.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> C. Jenis Pembayaran</p>
                      <p className="text-sm text-muted-foreground">Tentukan apa saja yang harus dibayar siswa (SPP, Buku, Seragam). Centang <strong>Berulang</strong> untuk pembayaran bulanan.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-2" className="border rounded-xl px-4 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</div>
                    <div>
                      <div className="font-bold">Manajemen Kelas & Siswa</div>
                      <div className="text-sm font-normal text-muted-foreground text-balance">Buat kelas terlebih dahulu sebelum menginput data siswa.</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2 space-y-4">
                  <div className="grid gap-4 ml-12">
                    <div className="space-y-2">
                      <p className="font-medium">Membuat Kelas</p>
                      <p className="text-sm text-muted-foreground">Daftarkan nama-nama kelas di menu <strong>Siswa → Kelas</strong>.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="font-medium">Menambah Siswa</p>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p className="flex items-start gap-2"><ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" /> <strong>Manual:</strong> Input satu per satu di Daftar Siswa.</p>
                        <p className="flex items-start gap-2"><ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-primary" /> <strong>Import Excel:</strong> Gunakan template Excel untuk input massal. Download template di menu Daftar Siswa.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-3" className="border rounded-xl px-4 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</div>
                    <div>
                      <div className="font-bold">Pencatatan Pembayaran</div>
                      <div className="text-sm font-normal text-muted-foreground text-balance">Gunakan fitur anti-double bayar untuk keamanan data.</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2 space-y-4">
                  <div className="grid gap-4 ml-12">
                    <div className="space-y-2">
                      <p className="font-medium text-yellow-600 flex items-center gap-2"><Zap className="h-4 w-4" /> Cara Cepat (Rekomendasi)</p>
                      <p className="text-sm text-muted-foreground">Klik tombol kuning <strong>⚡ Pencatatan Cepat</strong> di Dashboard.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="font-medium">Fitur "Tandai sebagai LUNAS"</p>
                      <p className="text-sm text-muted-foreground">Gunakan fitur ini jika siswa mendapat diskon, keringanan, atau beasiswa. Cukup input nominal yang dibayar (bisa Rp 0) lalu centang Lunas.</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 border border-green-100">
                      <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Anti Double Bayar</p>
                      <p className="text-[11px] text-green-600">Sistem akan memblokir pembayaran jika bulan/jenis tersebut sudah lunas.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-4" className="border rounded-xl px-4 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</div>
                    <div>
                      <div className="font-bold">Laporan & Tracking</div>
                      <div className="text-sm font-normal text-muted-foreground text-balance">Pantau tunggakan dan export laporan ke Excel.</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2 space-y-4">
                  <div className="grid gap-4 ml-12">
                    <div className="space-y-2">
                      <p className="font-medium">Tracking Tahunan</p>
                      <p className="text-sm text-muted-foreground">Lihat status pembayaran seluruh siswa dalam satu tabel besar. Hijau berarti lunas, putih berarti belum.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="font-medium">Export Excel (5 Sheet)</p>
                      <p className="text-sm text-muted-foreground">Laporan Excel sangat lengkap, mencakup ringkasan, detail transaksi, hingga statistik per kelas.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-5" className="border rounded-xl px-4 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">5</div>
                    <div>
                      <div className="font-bold">Kenaikan Kelas & Kelulusan</div>
                      <div className="text-sm font-normal text-muted-foreground text-balance">Proses otomatis di setiap akhir tahun ajaran.</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2 space-y-4">
                  <div className="grid gap-4 ml-12">
                    <p className="text-sm text-muted-foreground">Gunakan menu <strong>Siswa → Kelas → Kenaikan Kelas Otomatis</strong> untuk memindahkan siswa ke tingkat selanjutnya secara massal.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h2>PENTING: Keamanan Data</h2>
            </div>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-3">
                  <Database className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-destructive">Backup Rutin!</p>
                    <p className="text-sm text-muted-foreground">Aplikasi ini menyimpan data di <strong>browser komputer Anda</strong>. Jika browser di-reset atau komputer di-format, data bisa hilang.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">Solusi:</p>
                    <p className="text-sm text-muted-foreground">Lakukan backup minimal seminggu sekali di menu <strong>Pengaturan → Database</strong>. Simpan file backup (.json) di Google Drive atau Flashdisk.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-20 shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg">Bantuan Cepat</CardTitle>
              <CardDescription>Masalah yang sering terjadi</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Printer className="h-4 w-4 text-primary" />
                  <span>Cetak Kuitansi</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Jika kuitansi tidak muncul, pastikan browser tidak memblokir <strong>Popup</strong>. Gunakan format A4 untuk arsip atau Thermal untuk printer kasir.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span>Salah Input?</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Buka menu <strong>Pembayaran → Riwayat</strong>. Cari transaksi yang salah lalu hapus. Anda punya waktu 10 detik untuk menekan tombol <strong>UNDO</strong> jika salah hapus.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Import Excel Gagal?</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pastikan <strong>Nama Kelas</strong> di Excel sama persis dengan yang ada di sistem. Cek juga format NIS/NISN agar tidak duplikat.
                </p>
              </div>

              <div className="pt-4">
                <div className="rounded-xl bg-primary p-4 text-primary-foreground shadow-inner">
                  <p className="text-xs font-medium opacity-80">Versi Sistem</p>
                  <p className="text-lg font-bold">SPP Manager v2.0</p>
                  <p className="mt-2 text-[10px] opacity-70">Terakhir diperbarui: Desember 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

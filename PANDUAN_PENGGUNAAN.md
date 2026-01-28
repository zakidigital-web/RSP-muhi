# 📚 PANDUAN PENGGUNAAN SISTEM PEMBAYARAN SPP

## 🎯 Tentang Sistem

Sistem Pembayaran SPP adalah aplikasi berbasis web untuk mengelola pembayaran siswa SMP yang mencakup SPP bulanan, pembayaran buku, seragam, dan jenis pembayaran lainnya.

**✨ Fitur Unggulan:**
- 🚫 **Anti Double Bayar** - Sistem otomatis mencegah pembayaran ganda untuk transparansi data
- ✅ **Tandai sebagai LUNAS** - Flexible marking untuk pembayaran dengan keringanan/diskon
- 📊 **Export Excel Multi-Sheet** - Laporan lengkap dengan 5 sheet berbeda
- 📥 **Import/Export Data Siswa** - Template Excel untuk input data massal
- 🗑️ **Hapus Seluruh Data** - Fitur reset untuk testing atau awal tahun ajaran baru
- ⚡ **Pencatatan Cepat** - Input pembayaran langsung dari Dashboard

---

## 🚀 ALUR KERJA SISTEM

### **Langkah 1: Persiapan Awal**

Sebelum mulai menggunakan sistem, lakukan pengaturan dasar terlebih dahulu:

#### A. **Pengaturan Identitas Sekolah**
1. Buka menu **Pengaturan → Identitas Sekolah**
2. Isi informasi sekolah:
   - Nama Sekolah
   - Alamat Lengkap
   - Nomor Telepon
   - Email
   - Nama Kepala Sekolah
   - NPSN (Nomor Pokok Sekolah Nasional)
3. Klik **Simpan**

#### B. **Pengaturan Tahun Ajaran**
1. Buka menu **Pengaturan → Tahun Ajaran**
2. Klik **Tambah Tahun Ajaran**
3. Isi data tahun ajaran (contoh: 2024/2025)
4. Tentukan tanggal mulai dan selesai
5. **Aktifkan** tahun ajaran yang sedang berjalan
6. Klik **Simpan**

#### C. **Pengaturan Jenis Pembayaran**
1. Buka menu **Pengaturan → Jenis Pembayaran**
2. Klik **Tambah Jenis Pembayaran**
3. Buat jenis pembayaran sesuai kebutuhan:

**Contoh: SPP Bulanan**
- Nama: SPP Bulanan
- Jumlah: Rp 250.000
- ✅ **Pembayaran Berulang** (untuk pembayaran bulanan)
- ✅ **Izinkan Cicilan** (jika ingin pembayaran bisa dicicil)

**Contoh: Buku Paket**
- Nama: Buku Paket
- Jumlah: Rp 500.000
- ❌ **Pembayaran Berulang** (sekali bayar)
- ✅ **Izinkan Cicilan**

4. Klik **Simpan**

---

### **Langkah 2: Manajemen Kelas dan Siswa**

#### A. **Membuat Kelas**
1. Buka menu **Siswa → Manajemen Kelas**
2. Klik **Tambah Kelas**
3. Isi data kelas:
   - Nama Kelas: 7A, 7B, 8A, dst
   - Tingkat: 7, 8, atau 9
   - Pilih Tahun Ajaran
4. Klik **Simpan**
5. Ulangi untuk semua kelas yang ada

#### B. **Menambah Siswa**

**Cara 1: Input Manual (Satu per Satu)**
1. Buka menu **Siswa → Daftar Siswa**
2. Klik **Tambah Siswa**
3. Isi form data siswa dengan lengkap:
   - NIS (Nomor Induk Siswa)
   - NISN (Nomor Induk Siswa Nasional)
   - Nama Lengkap
   - Pilih Kelas
   - Jenis Kelamin
   - Tempat & Tanggal Lahir
   - Nama Orang Tua/Wali
   - No. HP Orang Tua
   - Alamat Lengkap
4. Klik **Simpan**

**Cara 2: Import Excel (Banyak Siswa Sekaligus)**
1. Buka menu **Siswa → Daftar Siswa**
2. Klik **Template Excel** untuk download template
3. Buka file template dan isi data siswa:
   - Lihat sheet **"Panduan"** untuk instruksi lengkap
   - Isi data di sheet **"Template Data Siswa"**
   - **PENTING:** Hapus baris contoh sebelum mengisi data asli
4. Simpan file Excel
5. Klik **Import Excel** di aplikasi
6. Pilih file Excel yang sudah diisi
7. Sistem akan memvalidasi dan menampilkan hasil import

**⚠️ Tips Import Excel:**
- Pastikan semua kelas sudah dibuat terlebih dahulu
- NIS dan NISN harus unik (tidak boleh duplikat)
- Format tanggal lahir: YYYY-MM-DD (contoh: 2010-05-15)
- Jenis kelamin: "Laki-laki" atau "Perempuan"

---

### **Langkah 3: Pencatatan Pembayaran**

Ada 2 cara untuk mencatat pembayaran:

#### **Cara 1: Pencatatan Cepat (dari Dashboard)** ⚡ REKOMENDASI
1. Di **Dashboard**, klik tombol besar **⚡ Pencatatan Cepat** (warna kuning/oranye)
2. Dialog akan muncul tanpa meninggalkan halaman dashboard
3. Isi form yang sama seperti pencatatan normal
4. Lebih cepat dan efisien!

#### **Cara 2: Pencatatan Normal (Menu Transaksi)**
1. Buka menu **Transaksi → Catat Pembayaran**
2. **Cari Siswa:**
   - Ketik nama, NIS, atau NISN di kolom pencarian
   - Pilih siswa dari hasil pencarian
3. **Pilih Jenis Pembayaran** dari dropdown
4. **Pilih Bulan** (jika pembayaran bulanan seperti SPP)
   - Bulan yang sudah lunas akan ditandai badge **LUNAS** hijau
   - ❌ **Tidak bisa memilih bulan yang sudah lunas** (anti double bayar)
5. **Isi Jumlah Bayar**

**🔒 Fitur Anti Double Bayar (PENTING!):**

**Untuk Pembayaran Berulang (SPP):**
- Sistem otomatis mencegah pembayaran ganda per bulan
- Bulan yang sudah LUNAS akan:
  - Disabled di dropdown (tidak bisa dipilih)
  - Ditandai badge hijau "LUNAS"
  - Tampil di status bulanan
- Jika coba bayar bulan yang sudah lunas, akan muncul error: "❌ Pembayaran bulan [X] sudah LUNAS! Tidak dapat membayar lagi"

**Untuk Pembayaran Sekali Bayar (Buku, Seragam, dll):**
- Sistem otomatis cek apakah siswa sudah pernah bayar jenis pembayaran tersebut
- Jika sudah LUNAS, akan muncul:
  - ⚠️ Peringatan merah di form
  - Pesan: "Siswa ini sudah pernah membayar [Jenis Pembayaran] dan statusnya LUNAS"
- Pembayaran akan diblock kecuali menggunakan cicilan
- Error message: "❌ Pembayaran [Jenis] sudah LUNAS! Tidak dapat membayar lagi"

**Kenapa Fitur Ini Penting:**
- ✅ Mencegah kesalahan input ganda
- ✅ Transparansi data pembayaran
- ✅ Hindari dispute dengan orang tua siswa
- ✅ Laporan lebih akurat

**Opsi Pembayaran Khusus:**

📋 **Pembayaran Cicilan** (untuk nominal besar)
- ✅ Centang "Pembayaran Cicilan"
- Isi cicilan ke berapa (contoh: 1, 2, 3)
- Isi total cicilan (contoh: 3x)
- Sistem akan track sisa pembayaran otomatis

✅ **Tandai sebagai LUNAS** (Fitur Penting!)
- Tersedia untuk SEMUA jenis pembayaran
- Centang "Tandai sebagai LUNAS" jika:
  - Pembayaran dibebaskan (gratis)
  - Ada diskon atau keringanan
  - Sudah disepakati sebagai lunas walaupun nominal tidak penuh
  - Siswa berprestasi/tidak mampu yang disubsidi
- **Berguna untuk transparansi data pembayaran**
- Pembayaran dengan status LUNAS:
  - Tidak bisa dibayar lagi (anti double bayar)
  - Dihitung sebagai terbayar di laporan
  - Ditampilkan dengan badge hijau "LUNAS"

**Contoh Penggunaan "Tandai sebagai LUNAS":**
1. **Pembebasan SPP**: Input Rp 0 → Centang LUNAS
2. **Diskon 50%**: Input Rp 125.000 (dari Rp 250.000) → Centang LUNAS
3. **Subsidi Buku**: Input Rp 200.000 (dari Rp 500.000) → Centang LUNAS
4. **Keringanan**: Input Rp 100.000 (dari Rp 250.000) → Centang LUNAS

6. **Pilih Metode Pembayaran**: Tunai, Transfer, atau Lainnya
7. **Tambah Catatan** (opsional, tapi recommended untuk pembayaran khusus)
8. Klik **Simpan Pembayaran**
9. **Cetak Kuitansi:**
   - Pilih **Cetak A4** untuk kuitansi ukuran kertas A4
   - Pilih **Cetak Thermal** untuk printer kasir
   - Kuitansi akan menampilkan "Bendahara" sebagai penerima

---

### **Langkah 4: Laporan dan Tracking**

#### **A. Tracking Pembayaran Tahunan**
1. Buka menu **Laporan → Tracking Pembayaran**
2. **Pilih Jenis Pembayaran** yang ingin di-track (contoh: SPP Bulanan)
3. Sistem akan menampilkan:
   - Status pembayaran setiap siswa per bulan
   - Total terbayar dan tunggakan
   - Persentase pembayaran
4. Klik **Export Excel** untuk download laporan lengkap

**📊 Laporan Excel Tracking Pembayaran berisi 5 Sheet:**
1. **Ringkasan** - Statistik pembayaran keseluruhan
2. **Tracking [Jenis Pembayaran]** - Status per siswa untuk jenis pembayaran dipilih
3. **Detail Transaksi** - Semua transaksi lengkap dengan kuitansi
4. **Tracking Semua** - Tracking SELURUH jenis pembayaran dalam satu sheet
5. **Ringkasan Per Kelas** - Statistik per kelas

**Urutan Siswa:** Otomatis terurut per kelas (7A→7I, 8A→8I, 9A→9I)

#### **B. Laporan Tunggakan**
1. Buka menu **Laporan → Daftar Tunggakan**
2. Lihat daftar siswa yang belum lunas
3. Filter berdasarkan:
   - Kelas tertentu
   - Jenis pembayaran
4. Klik **Export Excel** untuk cetak laporan
5. **Hanya siswa yang belum LUNAS yang muncul** - siswa dengan status LUNAS tidak dihitung tunggakan

#### **C. Riwayat Pembayaran Siswa**
1. Buka menu **Transaksi → Riwayat Pembayaran**
2. **Cari Siswa** dengan nama/NIS/NISN
3. Lihat semua pembayaran yang pernah dilakukan
4. **Cetak Ulang Kuitansi** jika diperlukan

**🗑️ Hapus Transaksi & Undo:**
- Klik tombol **Hapus** pada transaksi
- Sistem akan menampilkan notifikasi dengan tombol **UNDO**
- Klik **UNDO** dalam 10 detik untuk membatalkan penghapusan

---

### **Langkah 5: Kenaikan Kelas Otomatis**

Di akhir tahun ajaran, lakukan kenaikan kelas:

1. Buka menu **Siswa → Manajemen Kelas**
2. Klik **Kenaikan Kelas Otomatis**
3. Sistem akan:
   - Kelas 7 → Kelas 8
   - Kelas 8 → Kelas 9
   - Kelas 9 → Status "Lulus"
4. Konfirmasi kenaikan kelas
5. **Buat tahun ajaran baru** di menu Pengaturan → Tahun Ajaran

---

## 📊 DASHBOARD - PUSAT KONTROL

Dashboard menampilkan informasi penting secara real-time:

### **Statistik Pembayaran**
- 📈 Total Pembayaran Bulan Ini
- 💰 Total Nominal Bulan Ini
- 👥 Total Siswa Aktif
- 📊 Persentase Pembayaran

### **Aksi Cepat** ⚡ (Di atas grafik pembayaran)
- **⚡ Pencatatan Cepat** - Tombol besar kuning/oranye untuk input pembayaran langsung tanpa pindah halaman
- **Catat Pembayaran** - Buka halaman pencatatan lengkap
- **Tambah Siswa** - Daftar siswa baru
- **Lihat Tunggakan** - Cek siswa belum bayar
- **Cetak Kuitansi** - Akses riwayat pembayaran
- **Daftar Siswa** - Kelola data siswa
- **Export Laporan** - Download laporan Excel

### **Grafik Pembayaran**
- Tren pembayaran per bulan (tahun berjalan)
- Visualisasi jumlah transaksi dan nominal
- Grafik interaktif dengan tooltip

### **Pembayaran Terakhir**
- 10 transaksi terakhir
- Status pembayaran (Lunas/Cicilan)
- Nominal dan tanggal
- Nama siswa dan kelas

---

## 💡 TIPS & BEST PRACTICES

### **1. Backup Data Berkala** 💾
- Buka **Pengaturan → Manajemen Database**
- Klik **Download Backup** minimal seminggu sekali
- Simpan file JSON di tempat aman (Google Drive, flashdisk, dll)
- **PENTING**: Data disimpan di browser, jika browser di-reset data akan hilang!

### **2. Manajemen Data Siswa** 👥

**Import Excel (Rekomendasi untuk Data Banyak):**
- Download **Template Excel** dari menu Siswa
- Template berisi 2 sheet:
  - **Panduan**: Instruksi lengkap cara pengisian
  - **Template Data Siswa**: Form untuk diisi
- Isi data sesuai format (lihat contoh di template)
- **Penting**: Kelas harus sudah dibuat terlebih dahulu
- Import dapat validasi otomatis (NIS/NISN duplikat, format salah, dll)

**Export Excel:**
- Gunakan untuk backup data siswa
- Export data siswa yang sudah difilter (per kelas)
- File Excel bisa diedit dan di-import kembali

### **3. Pengecekan Rutin**
- Cek **Dashboard** setiap hari untuk monitoring
- Review **Laporan Tunggakan** setiap akhir bulan
- Export **Tracking Pembayaran** untuk arsip bulanan

### **4. Transparansi Pembayaran** 🔍
- Gunakan fitur **"Tandai sebagai LUNAS"** untuk keringanan/pembebasan
- Tambahkan **Catatan** pada setiap pembayaran khusus (contoh: "Diskon prestasi", "Subsidi", "Keringanan")
- Cetak dan berikan **Kuitansi** ke setiap siswa
- Sistem akan otomatis cegah double bayar untuk transparansi

### **5. Import Data Excel**
- Selalu download **Template Excel** terbaru
- Baca **sheet Panduan** sebelum mengisi data
- Test import dengan 2-3 data dulu sebelum import semua
- Sistem akan tampilkan jumlah sukses dan error

### **6. Manajemen Cicilan** 💳
- Catat setiap cicilan dengan jelas (cicilan ke-1 dari 3)
- Centang **"Tandai sebagai LUNAS"** pada cicilan terakhir
- Tambahkan catatan untuk tracking pembayaran cicilan
- Sistem akan track sisa pembayaran otomatis

### **7. Reset Data (Akhir Tahun Ajaran)** 🗑️
Jika ingin reset semua data untuk tahun ajaran baru:
1. **BACKUP DULU!** Download backup di Pengaturan → Database
2. Buka **Pengaturan → Manajemen Database**
3. Klik **"Hapus Seluruh Data"** (tombol merah)
4. Konfirmasi penghapusan
5. **Semua data akan terhapus**:
   - Data siswa dan kelas
   - Seluruh riwayat pembayaran dan transaksi
   - Data tahun ajaran
   - Jenis pembayaran
   - Identitas sekolah
6. Setup ulang dari awal

**⚠️ PERHATIAN:**
- Tindakan ini **TIDAK DAPAT DIBATALKAN**
- Pastikan sudah backup dan export semua laporan
- Gunakan hanya saat benar-benar perlu reset

---

## ⚠️ TROUBLESHOOTING

### **❌ Tidak Bisa Memilih Bulan yang Sudah Dibayar (SPP)**
**Ini BUKAN bug, tapi fitur keamanan!**
- Sistem otomatis mencegah double bayar
- Bulan yang sudah lunas tidak bisa dibayar lagi
- Lihat badge hijau "LUNAS" di dropdown bulan
- Cek di tracking pembayaran atau riwayat untuk konfirmasi

**Jika perlu koreksi:**
1. Buka **Riwayat Pembayaran**
2. Cari transaksi yang salah
3. Hapus transaksi tersebut
4. Input ulang dengan benar

### **❌ Peringatan "Siswa sudah pernah membayar [Jenis] dan statusnya LUNAS"**
**Ini fitur anti double bayar untuk pembayaran sekali bayar!**
- Sistem mencegah pembayaran ganda untuk Buku, Seragam, dll
- Muncul peringatan merah di form
- Pembayaran akan diblock saat submit

**Solusi:**
1. **Jika memang belum bayar**: Cek riwayat pembayaran, mungkin ada kesalahan data. Hapus pembayaran yang salah.
2. **Jika ingin cicilan lanjutan**: Centang "Pembayaran Cicilan" untuk melanjutkan pembayaran
3. **Jika memang sudah lunas**: Tidak perlu bayar lagi (sudah benar sistem block)

### **❌ Import Excel Gagal**
**Kemungkinan penyebab:**
1. **Kelas belum dibuat** - Buat kelas terlebih dahulu di menu Manajemen Kelas
2. **NIS/NISN duplikat** - Pastikan NIS dan NISN unik, tidak ada yang sama
3. **Format tanggal salah** - Gunakan format YYYY-MM-DD (contoh: 2010-05-15)
4. **Kolom tidak lengkap** - Isi semua kolom wajib (NIS, NISN, Nama, Kelas, dll)
5. **Jenis Kelamin salah** - Harus "Laki-laki" atau "Perempuan" (huruf besar di awal)

**Solusi:** 
- Perhatikan pesan error yang muncul (sistem akan beritahu baris mana yang error)
- Perbaiki baris yang bermasalah di Excel
- Import ulang

### **❌ Kuitansi Tidak Tercetak**
**Solusi:**
1. **Browser memblock popup** - Izinkan popup untuk situs ini
2. **Printer tidak terhubung** - Cek koneksi printer (untuk thermal)
3. **Coba cetak ulang** dari **Riwayat Pembayaran**:
   - Cari transaksi
   - Klik ikon printer
   - Pilih format (A4 atau Thermal)

**Tips Cetak:**
- **A4**: Gunakan untuk arsip sekolah (tanda tangan basah)
- **Thermal**: Gunakan untuk siswa (lebih cepat, praktis)
- Kuitansi menampilkan "Bendahara" sebagai penerima

### **❌ Data Hilang**
**Penyebab:**
- Cache browser terhapus
- Browser di-reset/reinstall
- Komputer di-format
- Clear browsing data

**Solusi:**
1. Restore dari file backup terakhir:
   - Buka **Pengaturan → Manajemen Database**
   - Klik **Pilih File** di bagian Import
   - Pilih file backup (.json)
   - Klik **Import**
2. Jika tidak ada backup, data tidak dapat dikembalikan
3. **Pencegahan**: Backup rutin minimal 1x seminggu!

---

## 🔐 KEAMANAN DATA

### **Data Disimpan di Browser (Local Storage)**
- Data tersimpan di browser pengguna
- Tidak tersimpan di server/cloud
- Aman dari akses pihak ketiga
- Ukuran maksimal: ~5 MB

### **Risiko:**
- ⚠️ Data akan hilang jika:
  - Cache browser dihapus
  - Browser di-reset/reinstall
  - Komputer di-format
  - Clear browsing data
  - Hapus seluruh data dari menu Database

### **Solusi Keamanan:**
1. ✅ **Backup rutin** setiap minggu (WAJIB!)
2. ✅ Simpan backup di **multiple lokasi**:
   - Google Drive (sync otomatis)
   - Flashdisk/Harddisk Eksternal
   - Email ke diri sendiri
   - Cloud storage lain
3. ✅ **Jangan hapus cache browser** tanpa backup terlebih dahulu
4. ✅ Gunakan **1 browser khusus** untuk aplikasi ini
5. ✅ Label file backup dengan tanggal (contoh: `backup-spp-2024-12-01.json`)

### **Format File Backup:**
- Format: JSON
- Nama file: `spp-backup-YYYY-MM-DD.json`
- Isi: Semua data sistem (siswa, kelas, pembayaran, pengaturan)
- Ukuran: Tergantung jumlah data (biasanya < 5 MB)

---

## 📝 CHECKLIST PENGGUNAAN HARIAN

**Pagi Hari:**
- [ ] Cek Dashboard untuk statistik terkini
- [ ] Review pembayaran yang masuk kemarin
- [ ] Pastikan printer siap (kertas, tinta)

**Saat Ada Pembayaran:**
- [ ] Gunakan **Pencatatan Cepat** dari Dashboard (lebih cepat!)
- [ ] Cari dan pilih siswa
- [ ] Pilih jenis pembayaran dan bulan
- [ ] **Cek peringatan anti double bayar** (jika muncul)
- [ ] Pastikan nominal sesuai
- [ ] Gunakan fitur **LUNAS** jika ada keringanan/subsidi
- [ ] Tambahkan **Catatan** untuk pembayaran khusus
- [ ] Cetak kuitansi dan berikan ke siswa

**Akhir Hari:**
- [ ] Review total pembayaran hari ini di Dashboard
- [ ] Cek apakah ada transaksi yang perlu dikoreksi
- [ ] Sesuaikan dengan uang cash yang diterima

**Akhir Minggu:**
- [ ] **Download backup data** (WAJIB!)
- [ ] Export laporan tracking pembayaran
- [ ] Review daftar tunggakan

**Akhir Bulan:**
- [ ] Export laporan lengkap Excel (5 sheet)
- [ ] Arsip laporan untuk dokumentasi
- [ ] Kirim reminder ke siswa yang menunggak
- [ ] **Backup data bulanan** (simpan dengan label bulan)

**Akhir Tahun Ajaran:**
- [ ] Export semua laporan tahunan
- [ ] **Backup data lengkap** (simpan dengan label tahun ajaran)
- [ ] Export data siswa (untuk referensi)
- [ ] Lakukan kenaikan kelas otomatis
- [ ] Buat tahun ajaran baru
- [ ] (Optional) Reset data jika diperlukan

---

## 🎉 SELAMAT MENGGUNAKAN!

Sistem ini dirancang untuk **memudahkan** pengelolaan pembayaran sekolah dengan fitur yang **lengkap, aman, dan mudah digunakan**. 

Manfaatkan semua fitur yang ada untuk **efisiensi** dan **transparansi** pengelolaan keuangan sekolah.

**Fitur-fitur unggulan:**
- ✅ Anti Double Bayar untuk transparansi
- ✅ Tandai sebagai LUNAS untuk flexible marking
- ✅ Export Excel 5 sheet untuk analisis lengkap
- ✅ Import/Export data siswa untuk efisiensi
- ✅ Pencatatan Cepat dari Dashboard
- ✅ Cetak kuitansi A4 & Thermal

**Semoga sukses mengelola pembayaran sekolah! 🚀**

---

**Versi: 2.0**  
**Terakhir Diperbarui: Desember 2024**
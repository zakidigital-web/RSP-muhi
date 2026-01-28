<user_request>buatkan saya aplikasi pembayaran untuk siswa SMP dimana beberapa fiturnya seperti deskripsi di bawah ini

 ### **1. Dashboard**
- Statistik pembayaran real-time
- Grafik perkembangan pembayaran
- Quick actions

### **2. Manajemen Siswa**
- CRUD data siswa
- Import/Export data
- Pengelolaan kelas
- Kenaikan kelas otomatis

### **3. Sistem Pembayaran**
- Pencatatan pembayaran
- Multiple payment types (SPP, Buku, Seragam, dll)
- Receipt/Kuitansi printing (A4 & Thermal)
- Payment history per siswa

### **4. Laporan & Tracking**
- **Tracking Pembayaran Tahunan**: Monitoring status pembayaran per tahun ajaran
- **Laporan Bulanan**: Rekap pembayaran per bulan
- **Laporan Tahunan**: Rekap per tahun ajaran
- **Laporan Buku Besar**: Ledger keuangan lengkap
- **Daftar Tunggakan**: Siswa yang belum lunas
- Export ke Excel

### **5. Pengaturan**
- **Jenis Pembayaran**: Setup payment types (recurring/non-recurring)
- **Identitas Sekolah**: Info sekolah untuk kuitansi
- **Periode Akademik**: Tahun ajaran aktif
- **Manajemen Database**: Import/Export/Reset data</user_request>

<todo_list>
1. Create database schema with Prisma for students, payments, payment types, academic periods, and school settings. Set up localStorage-based data persistence layer
2. Build Dashboard page with payment statistics cards, charts showing payment trends, and quick action buttons for common tasks
3. Create Student Management pages with CRUD operations, class management, data import/export functionality, and automatic grade promotion feature
4. Implement Payment System with payment recording form, multiple payment type support, payment history view, and receipt/kuitansi printing (both A4 and thermal formats)
5. Build Reports & Settings pages including annual/monthly payment tracking, outstanding payments list, Excel export, payment type configuration, school identity settings, and academic period management
</todo_list>
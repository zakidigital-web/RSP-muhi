'use client';

import { useState, useEffect, useRef } from 'react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Users,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useStudents } from '@/hooks/useStudents';
import { StudentForm } from './StudentForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Updated type to match database schema (integer id)
interface Student {
  id: number;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: number | null;
  className: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClassInfo {
  id: number;
  name: string;
  grade: number;
}

export function StudentList() {
  const { students, isLoading, deleteStudent, refresh } = useStudents();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes?limit=100');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchSearch = 
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.nis.includes(search) ||
      student.nisn.includes(search);
    const matchClass = filterClass === 'all' || student.classId?.toString() === filterClass;
    return matchSearch && matchClass && student.status === 'active';
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      const result = await deleteStudent(studentToDelete.id);
      if (result.success) {
        toast.success('Siswa berhasil dihapus');
      } else {
        toast.error('Gagal menghapus siswa');
      }
    }
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    refresh();
  };

  const handleExport = () => {
    // Prepare data for Excel
    const excelData = filteredStudents.map(s => ({
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Lengkap': s.name,
      'Kelas': s.className,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tempat Lahir': s.birthPlace,
      'Tanggal Lahir': s.birthDate,
      'Nama Orang Tua/Wali': s.parentName,
      'No. HP Orang Tua': s.parentPhone,
      'Alamat': s.address,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 },  // NIS
      { wch: 15 },  // NISN
      { wch: 25 },  // Nama
      { wch: 10 },  // Kelas
      { wch: 15 },  // Jenis Kelamin
      { wch: 20 },  // Tempat Lahir
      { wch: 15 },  // Tanggal Lahir
      { wch: 25 },  // Nama Orang Tua
      { wch: 15 },  // No HP
      { wch: 40 },  // Alamat
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, `data-siswa-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data siswa berhasil diexport ke Excel');
  };

  const handleDownloadTemplate = () => {
    // Create template with sample data
    const templateData = [
      {
        'NIS': '2024001',
        'NISN': '0012345678',
        'Nama Lengkap': 'Contoh Nama Siswa',
        'Kelas': '7A',
        'Jenis Kelamin': 'Laki-laki',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2010-01-15',
        'Nama Orang Tua/Wali': 'Nama Orang Tua',
        'No. HP Orang Tua': '081234567890',
        'Alamat': 'Jl. Contoh No. 123, Jakarta',
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
    ];

    // Add instructions sheet
    const instructions = [
      ['PANDUAN IMPORT DATA SISWA'],
      [''],
      ['Format Data:'],
      ['1. NIS: Nomor Induk Siswa (contoh: 2024001)'],
      ['2. NISN: Nomor Induk Siswa Nasional (contoh: 0012345678)'],
      ['3. Nama Lengkap: Nama lengkap siswa'],
      ['4. Kelas: Nama kelas (contoh: 7A, 8B, 9C)'],
      ['5. Jenis Kelamin: Pilih "Laki-laki" atau "Perempuan"'],
      ['6. Tempat Lahir: Tempat lahir siswa'],
      ['7. Tanggal Lahir: Format YYYY-MM-DD (contoh: 2010-01-15)'],
      ['8. Nama Orang Tua/Wali: Nama lengkap orang tua/wali'],
      ['9. No. HP Orang Tua: Nomor HP yang bisa dihubungi'],
      ['10. Alamat: Alamat lengkap siswa'],
      [''],
      ['Catatan:'],
      ['- Hapus baris contoh sebelum mengisi data siswa'],
      ['- Pastikan kelas sudah dibuat terlebih dahulu di menu Manajemen Kelas'],
      ['- NIS dan NISN harus unik (tidak boleh duplikat)'],
      ['- Semua kolom wajib diisi'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];

    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Panduan');
    XLSX.utils.book_append_sheet(wb, ws, 'Template Data Siswa');
    
    XLSX.writeFile(wb, 'template-import-siswa.xlsx');
    toast.success('Template Excel berhasil didownload');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet (should be Template Data Siswa or Data Siswa)
        const sheetName = workbook.SheetNames.find(name => 
          name.includes('Template') || name.includes('Data Siswa')
        ) || workbook.SheetNames[0];
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          toast.error('File Excel kosong atau format tidak valid');
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let index = 0; index < jsonData.length; index++) {
          const row = jsonData[index];
          try {
            // Validate required fields
            const requiredFields = [
              'NIS', 'NISN', 'Nama Lengkap', 'Kelas', 
              'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir',
              'Nama Orang Tua/Wali', 'No. HP Orang Tua', 'Alamat'
            ];

            const missingFields = requiredFields.filter(field => !row[field]);
            if (missingFields.length > 0) {
              errors.push(`Baris ${index + 2}: Field tidak lengkap (${missingFields.join(', ')})`);
              errorCount++;
              continue;
            }

            // Find class by name
            const className = row['Kelas'].toString().trim();
            const classInfo = classes.find(c => c.name === className);
            if (!classInfo) {
              errors.push(`Baris ${index + 2}: Kelas "${className}" tidak ditemukan`);
              errorCount++;
              continue;
            }

            // Parse gender
            const genderStr = row['Jenis Kelamin'].toString().toLowerCase();
            const gender = genderStr.includes('laki') ? 'L' : 'P';

            // Create student object
            const newStudent = {
              nis: row['NIS'].toString(),
              nisn: row['NISN'].toString(),
              name: row['Nama Lengkap'].toString(),
              classId: classInfo.id,
              className: classInfo.name,
              gender,
              birthPlace: row['Tempat Lahir'].toString(),
              birthDate: row['Tanggal Lahir'].toString(),
              address: row['Alamat'].toString(),
              parentName: row['Nama Orang Tua/Wali'].toString(),
              parentPhone: row['No. HP Orang Tua'].toString(),
              status: 'active',
            };

            // Add to database via API
            const response = await fetch('/api/students', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newStudent),
            });

            if (!response.ok) {
              const error = await response.json();
              errors.push(`Baris ${index + 2}: ${error.error || 'Gagal menambahkan'}`);
              errorCount++;
            } else {
              successCount++;
            }
          } catch (error) {
            errors.push(`Baris ${index + 2}: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`);
            errorCount++;
          }
        }

        // Show results
        if (successCount > 0) {
          await refresh();
          toast.success(`Berhasil import ${successCount} siswa`);
        }
        
        if (errorCount > 0) {
          const errorMessage = errors.slice(0, 5).join('\n');
          toast.error(`Gagal import ${errorCount} siswa:\n${errorMessage}${errors.length > 5 ? '\n...' : ''}`);
        }

      } catch (error) {
        toast.error('Gagal membaca file Excel. Pastikan format file benar.');
      }
    };

    reader.readAsBinaryString(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Siswa</h1>
          <p className="text-muted-foreground">
            Kelola data siswa SMP
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDownloadTemplate} size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Template Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            size="sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImport}
        className="hidden"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Total: {filteredStudents.length} siswa</CardTitle>
                <CardDescription>dari {students.filter(s => s.status === 'active').length} siswa aktif</CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIS, NISN..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select 
                value={filterClass} 
                onValueChange={(value) => {
                  setFilterClass(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      Kelas {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead className="hidden md:table-cell">Jenis Kelamin</TableHead>
                    <TableHead className="hidden lg:table-cell">Orang Tua</TableHead>
                    <TableHead className="hidden sm:table-cell">No. HP</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data siswa
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{student.nis}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.className}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{student.parentName}</TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-sm">{student.parentPhone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(student)}
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


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
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
        </CardContent>
      </Card>

      {/* Student Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Perbarui data siswa' : 'Isi data siswa baru'}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={editingStudent}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus siswa "{studentToDelete?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
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
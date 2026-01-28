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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, GraduationCap, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ClassInfo {
  id: number;
  name: string;
  grade: number;
  academicYearId: number | null;
  createdAt: string;
}

interface Student {
  id: number;
  classId: number | null;
  className: string;
  status: 'active' | 'graduated' | 'moved';
}

export function ClassManagement() {
  const [classes, setClassesState] = useState<ClassInfo[]>([]);
  const [students, setStudentsState] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassInfo | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    grade: '7',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, studentsRes] = await Promise.all([
        fetch('/api/classes?limit=1000'),
        fetch('/api/students?limit=1000')
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClassesState(Array.isArray(classesData) ? classesData : []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudentsState(Array.isArray(studentsData) ? studentsData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentCount = (classId: number) => {
    return students.filter(s => s.classId === classId && s.status === 'active').length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Nama kelas wajib diisi');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        grade: parseInt(formData.grade),
      };

      // For PUT, send ID via query parameter
      const url = editingClass 
        ? `/api/classes?id=${editingClass.id}`
        : '/api/classes';

      const response = await fetch(url, {
        method: editingClass ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save class');
      }

      toast.success(editingClass ? 'Kelas berhasil diperbarui' : 'Kelas baru berhasil ditambahkan');
      setIsFormOpen(false);
      setEditingClass(null);
      setFormData({ name: '', grade: '7' });
      await loadData();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan kelas');
    }
  };

  const handleEdit = (cls: ClassInfo) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, grade: cls.grade.toString() });
    setIsFormOpen(true);
  };

  const handleDelete = (cls: ClassInfo) => {
    const studentCount = getStudentCount(cls.id);
    if (studentCount > 0) {
      toast.error(`Tidak bisa menghapus kelas yang masih memiliki ${studentCount} siswa`);
      return;
    }
    setClassToDelete(cls);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        // For DELETE, send ID via query parameter
        const response = await fetch(`/api/classes?id=${classToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete class');
        }

        toast.success('Kelas berhasil dihapus');
        await loadData();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error(error instanceof Error ? error.message : 'Gagal menghapus kelas');
      }
    }
    setIsDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handlePromote = async () => {
    try {
      // Update students via API for class promotion
      const updatedStudents = students.map(student => {
        if (student.status !== 'active') return null;

        const currentClass = classes.find(c => c.id === student.classId);
        if (!currentClass) return null;

        if (currentClass.grade === 9) {
          // Kelas 9 lulus
          return { ...student, status: 'graduated' as const };
        }

        // Naik kelas
        const nextGrade = currentClass.grade + 1;
        const section = currentClass.name.slice(1);
        const nextClass = classes.find(c => c.grade === nextGrade && c.name.endsWith(section));
        
        if (nextClass) {
          return {
            ...student,
            classId: nextClass.id,
            className: nextClass.name,
          };
        }
        return null;
      }).filter(Boolean);

      // Batch update students
      const response = await fetch('/api/students/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedStudents }),
      });

      if (!response.ok) throw new Error('Failed to promote students');

      toast.success('Kenaikan kelas berhasil dilakukan!');
      setIsPromoteDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error promoting students:', error);
      toast.error('Gagal melakukan kenaikan kelas');
    }
  };

  // Group classes by grade
  const classesByGrade = classes.reduce((acc, cls) => {
    if (!acc[cls.grade]) acc[cls.grade] = [];
    acc[cls.grade].push(cls);
    return acc;
  }, {} as Record<number, ClassInfo[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Kelas</h1>
          <p className="text-muted-foreground">Kelola data kelas dan kenaikan kelas</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <LoadingSpinner size="lg" text="Memuat data kelas..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Kelas</h1>
          <p className="text-muted-foreground">
            Kelola data kelas dan kenaikan kelas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPromoteDialogOpen(true)}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Kenaikan Kelas
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kelas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[7, 8, 9].map(grade => (
          <Card key={grade}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kelas {grade}</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => {
                  const cls = classes.find(c => c.id === s.classId);
                  return cls?.grade === grade && s.status === 'active';
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                siswa di {classesByGrade[grade]?.length || 0} kelas
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>Semua kelas yang tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Jumlah Siswa</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Tidak ada data kelas
                    </TableCell>
                  </TableRow>
                ) : (
                  classes
                    .sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name))
                    .map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">Kelas {cls.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Kelas {cls.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {getStudentCount(cls.id)} siswa
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(cls)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(cls)}
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

      {/* Add/Edit Class Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingClass ? 'Perbarui data kelas' : 'Buat kelas baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: 7A, 8B, 9C"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Tingkat</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Kelas 7</SelectItem>
                  <SelectItem value="8">Kelas 8</SelectItem>
                  <SelectItem value="9">Kelas 9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsFormOpen(false);
                setEditingClass(null);
                setFormData({ name: '', grade: '7' });
              }}>
                Batal
              </Button>
              <Button type="submit">
                {editingClass ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kelas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kelas "{classToDelete?.name}"?
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

      {/* Promote Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kenaikan Kelas</DialogTitle>
            <DialogDescription>
              Fitur ini akan menaikkan semua siswa ke kelas berikutnya:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Siswa kelas 7 → Kelas 8</li>
                <li>Siswa kelas 8 → Kelas 9</li>
                <li>Siswa kelas 9 → Lulus</li>
              </ul>
              <br />
              <strong>Apakah Anda yakin ingin melanjutkan?</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handlePromote}>
              Ya, Lakukan Kenaikan Kelas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
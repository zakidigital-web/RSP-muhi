'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Updated types to match database schema
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

interface StudentFormProps {
  student: Student | null;
  onClose: () => void;
}

export function StudentForm({ student, onClose }: StudentFormProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    classId: '',
    birthPlace: '',
    birthDate: '',
    address: '',
    parentName: '',
    parentPhone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClasses();
    
    if (student) {
      setFormData({
        nis: student.nis,
        nisn: student.nisn,
        name: student.name,
        gender: student.gender,
        classId: student.classId?.toString() || '',
        birthPlace: student.birthPlace,
        birthDate: student.birthDate,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
      });
    }
  }, [student]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/classes?limit=100');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Gagal memuat data kelas');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nis) newErrors.nis = 'NIS wajib diisi';
    if (!formData.nisn) newErrors.nisn = 'NISN wajib diisi';
    if (!formData.name) newErrors.name = 'Nama wajib diisi';
    if (!formData.classId) newErrors.classId = 'Kelas wajib dipilih';
    if (!formData.birthPlace) newErrors.birthPlace = 'Tempat lahir wajib diisi';
    if (!formData.birthDate) newErrors.birthDate = 'Tanggal lahir wajib diisi';
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';
    if (!formData.parentName) newErrors.parentName = 'Nama orang tua wajib diisi';
    if (!formData.parentPhone) newErrors.parentPhone = 'No. HP wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const selectedClass = classes.find(c => c.id.toString() === formData.classId);
    if (!selectedClass) {
      toast.error('Kelas tidak valid');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nis: formData.nis,
        nisn: formData.nisn,
        name: formData.name,
        gender: formData.gender,
        classId: selectedClass.id,
        className: selectedClass.name,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        status: 'active',
      };

      if (student) {
        // Update existing student
        const response = await fetch(`/api/students?id=${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update student');
        }

        toast.success('Data siswa berhasil diperbarui');
      } else {
        // Add new student
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add student');
        }

        toast.success('Siswa baru berhasil ditambahkan');
      }

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nis">NIS *</Label>
          <Input
            id="nis"
            value={formData.nis}
            onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
            placeholder="Nomor Induk Siswa"
            disabled={isSubmitting}
          />
          {errors.nis && <p className="text-sm text-destructive">{errors.nis}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nisn">NISN *</Label>
          <Input
            id="nisn"
            value={formData.nisn}
            onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
            placeholder="Nomor Induk Siswa Nasional"
            disabled={isSubmitting}
          />
          {errors.nisn && <p className="text-sm text-destructive">{errors.nisn}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nama lengkap siswa"
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gender">Jenis Kelamin *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value: 'L' | 'P') => setFormData({ ...formData, gender: value })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Kelas *</Label>
          <Select
            value={formData.classId}
            onValueChange={(value) => setFormData({ ...formData, classId: value })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  Kelas {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && <p className="text-sm text-destructive">{errors.classId}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birthPlace">Tempat Lahir *</Label>
          <Input
            id="birthPlace"
            value={formData.birthPlace}
            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
            placeholder="Kota kelahiran"
            disabled={isSubmitting}
          />
          {errors.birthPlace && <p className="text-sm text-destructive">{errors.birthPlace}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Tanggal Lahir *</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            disabled={isSubmitting}
          />
          {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Alamat *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Alamat lengkap"
          rows={2}
          disabled={isSubmitting}
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parentName">Nama Orang Tua *</Label>
          <Input
            id="parentName"
            value={formData.parentName}
            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
            placeholder="Nama orang tua/wali"
            disabled={isSubmitting}
          />
          {errors.parentName && <p className="text-sm text-destructive">{errors.parentName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentPhone">No. HP Orang Tua *</Label>
          <Input
            id="parentPhone"
            value={formData.parentPhone}
            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            disabled={isSubmitting}
          />
          {errors.parentPhone && <p className="text-sm text-destructive">{errors.parentPhone}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Menyimpan...
            </>
          ) : (
            student ? 'Simpan Perubahan' : 'Tambah Siswa'
          )}
        </Button>
      </div>
    </form>
  );
}
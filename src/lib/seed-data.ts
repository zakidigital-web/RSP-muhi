'use client';

import { 
  Student, 
  ClassInfo, 
  PaymentType, 
  Payment, 
  AcademicYear 
} from './types';
import { 
  setStudents, 
  setClasses, 
  setPaymentTypes, 
  setPayments, 
  setAcademicYears,
  setInitialized,
  isInitialized,
  generateId,
  generateReceiptNumber
} from './storage';

const firstNames = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Galih', 'Hana',
  'Irfan', 'Joko', 'Kartika', 'Lina', 'Mira', 'Nanda', 'Omar', 'Putri',
  'Qori', 'Rini', 'Sari', 'Tono', 'Umar', 'Vina', 'Wati', 'Yani', 'Zaki'
];

const lastNames = [
  'Pratama', 'Wijaya', 'Kusuma', 'Sari', 'Putra', 'Dewi', 'Santoso',
  'Hidayat', 'Rahman', 'Siregar', 'Nasution', 'Harahap', 'Lubis', 'Syahputra'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNIS(index: number): string {
  return `2024${String(index + 1).padStart(4, '0')}`;
}

function generateNISN(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

export function initializeSeedData(): void {
  if (isInitialized()) return;

  const now = new Date().toISOString();

  // Create Academic Year
  const academicYear: AcademicYear = {
    id: generateId(),
    name: '2024/2025',
    startDate: '2024-07-15',
    endDate: '2025-06-30',
    isActive: true,
    createdAt: now,
  };
  setAcademicYears([academicYear]);

  // Create Classes
  const classes: ClassInfo[] = [];
  const grades = [7, 8, 9];
  const sections = ['A', 'B', 'C'];
  
  grades.forEach(grade => {
    sections.forEach(section => {
      classes.push({
        id: generateId(),
        name: `${grade}${section}`,
        grade,
        academicYearId: academicYear.id,
        createdAt: now,
      });
    });
  });
  setClasses(classes);

  // Create Payment Types
  const paymentTypes: PaymentType[] = [
    {
      id: generateId(),
      name: 'SPP',
      amount: 150000,
      isRecurring: true,
      description: 'Sumbangan Pembinaan Pendidikan bulanan',
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Buku Paket',
      amount: 350000,
      isRecurring: false,
      description: 'Buku pelajaran untuk satu tahun ajaran',
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Seragam',
      amount: 500000,
      isRecurring: false,
      description: 'Seragam sekolah lengkap',
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Kegiatan',
      amount: 200000,
      isRecurring: false,
      description: 'Dana kegiatan ekstrakurikuler',
      createdAt: now,
    },
    {
      id: generateId(),
      name: 'Ujian',
      amount: 100000,
      isRecurring: false,
      description: 'Biaya ujian semester',
      createdAt: now,
    },
  ];
  setPaymentTypes(paymentTypes);

  // Create Students (30 students per class = 270 total)
  const students: Student[] = [];
  let studentIndex = 0;
  
  classes.forEach(cls => {
    for (let i = 0; i < 30; i++) {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const gender = Math.random() > 0.5 ? 'L' : 'P';
      
      students.push({
        id: generateId(),
        nis: generateNIS(studentIndex),
        nisn: generateNISN(),
        name: `${firstName} ${lastName}`,
        gender: gender as 'L' | 'P',
        classId: cls.id,
        className: cls.name,
        birthPlace: randomItem(['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang']),
        birthDate: `${2010 + Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        address: `Jl. ${randomItem(['Merdeka', 'Sudirman', 'Gatot Subroto', 'Ahmad Yani', 'Diponegoro'])} No. ${Math.floor(Math.random() * 100) + 1}`,
        parentName: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        parentPhone: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      studentIndex++;
    }
  });
  setStudents(students);

  // Create sample payments (SPP for months 7-11 for some students)
  const payments: Payment[] = [];
  const sppType = paymentTypes.find(t => t.name === 'SPP')!;
  const months = [7, 8, 9, 10, 11]; // July to November
  
  students.forEach(student => {
    // Random number of months paid (0-5)
    const monthsPaid = Math.floor(Math.random() * 6);
    const paidMonths = months.slice(0, monthsPaid);
    
    paidMonths.forEach(month => {
      payments.push({
        id: generateId(),
        studentId: student.id,
        studentName: student.name,
        studentNis: student.nis,
        className: student.className,
        paymentTypeId: sppType.id,
        paymentTypeName: sppType.name,
        amount: sppType.amount,
        month,
        year: 2024,
        academicYearId: academicYear.id,
        paymentDate: `2024-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        receiptNumber: generateReceiptNumber(),
        paymentMethod: randomItem(['cash', 'transfer', 'cash']),
        notes: '',
        createdBy: 'Admin',
        createdAt: now,
      });
    });
  });
  setPayments(payments);

  setInitialized();
}
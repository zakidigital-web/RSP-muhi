// Data types for the student payment application

export interface Student {
  id: number;
  nis: string; // Nomor Induk Siswa
  nisn: string; // Nomor Induk Siswa Nasional
  name: string;
  gender: 'L' | 'P';
  classId: number | null;
  className: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: string;
  updatedAt: string;
}

export interface ClassInfo {
  id: number;
  name: string; // e.g., "7A", "7B", "8A"
  grade: number; // 7, 8, or 9
  academicYearId: number | null;
  createdAt: string;
}

export interface PaymentType {
  id: number;
  name: string; // e.g., "SPP", "Buku", "Seragam"
  amount: number;
  isRecurring: boolean; // true for monthly payments like SPP
  allowInstallment: boolean; // true if installment payments are allowed
  description: string | null;
  fromMonth?: number | null;
  fromYear?: number | null;
  toMonth?: number | null;
  toYear?: number | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  studentNis: string;
  className: string;
  paymentTypeId: number;
  paymentTypeName: string;
  amount: number;
  month?: number | null; // 1-12, for recurring payments
  year: number;
  academicYearId: number;
  paymentDate: string;
  receiptNumber: string;
  paymentMethod: 'cash' | 'transfer' | 'other';
  notes: string | null;
  createdBy: string;
  createdAt: string;
  
  // Installment fields
  isInstallment: boolean;
  installmentOf?: number | null; // Parent payment ID for installment payments
  installmentNumber?: number | null; // 1, 2, 3, etc.
  totalInstallments?: number | null; // Total number of installments planned
  
  // Paid off fields
  isPaidOff: boolean; // Mark as paid off manually
  originalAmount?: number | null; // Original amount if different from paid amount
  remainingAmount?: number | null; // Remaining unpaid amount
}

export interface AcademicYear {
  id: number;
  name: string; // e.g., "2024/2025"
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  npsn: string; // Nomor Pokok Sekolah Nasional
  logo?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalPaymentsThisMonth: number;
  totalAmountThisMonth: number;
  totalOutstanding: number;
  paymentRate: number; // percentage
}

export interface MonthlyPaymentSummary {
  month: number;
  year: number;
  totalAmount: number;
  totalTransactions: number;
}

export interface StudentPaymentStatus {
  studentId: number;
  studentName: string;
  studentNis: string;
  className: string;
  paidMonths: number[];
  unpaidMonths: number[];
  totalPaid: number;
  totalDue: number;
}

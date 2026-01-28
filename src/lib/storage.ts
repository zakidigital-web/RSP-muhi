'use client';

import { 
  Student, 
  ClassInfo, 
  PaymentType, 
  Payment, 
  AcademicYear, 
  SchoolInfo 
} from './types';

const STORAGE_KEYS = {
  STUDENTS: 'spp_students',
  CLASSES: 'spp_classes',
  PAYMENT_TYPES: 'spp_payment_types',
  PAYMENTS: 'spp_payments',
  ACADEMIC_YEARS: 'spp_academic_years',
  SCHOOL_INFO: 'spp_school_info',
  INITIALIZED: 'spp_initialized',
};

// Generic storage functions with error handling
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-component synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('local-storage'));
    }
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Students
export function getStudents(): Student[] {
  return getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
}

export function setStudents(students: Student[]): void {
  setItem(STORAGE_KEYS.STUDENTS, students);
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  setStudents(students);
}

export function updateStudent(student: Student): void {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  if (index !== -1) {
    students[index] = { ...student, updatedAt: new Date().toISOString() };
    setStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id);
  setStudents(students);
}

// Classes
export function getClasses(): ClassInfo[] {
  return getItem<ClassInfo[]>(STORAGE_KEYS.CLASSES, []);
}

export function setClasses(classes: ClassInfo[]): void {
  setItem(STORAGE_KEYS.CLASSES, classes);
}

export function addClass(classData: ClassInfo): void {
  const classes = getClasses();
  classes.push(classData);
  setClasses(classes);
}

export function updateClass(classData: ClassInfo): void {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === classData.id);
  if (index !== -1) {
    classes[index] = classData;
    setClasses(classes);
  }
}

export function deleteClass(id: string): void {
  const classes = getClasses().filter(c => c.id !== id);
  setClasses(classes);
}

// Payment Types
export function getPaymentTypes(): PaymentType[] {
  return getItem<PaymentType[]>(STORAGE_KEYS.PAYMENT_TYPES, []);
}

export function setPaymentTypes(types: PaymentType[]): void {
  setItem(STORAGE_KEYS.PAYMENT_TYPES, types);
}

export function addPaymentType(type: PaymentType): void {
  const types = getPaymentTypes();
  types.push(type);
  setPaymentTypes(types);
}

export function updatePaymentType(type: PaymentType): void {
  const types = getPaymentTypes();
  const index = types.findIndex(t => t.id === type.id);
  if (index !== -1) {
    types[index] = type;
    setPaymentTypes(types);
  }
}

export function deletePaymentType(id: string): void {
  const types = getPaymentTypes().filter(t => t.id !== id);
  setPaymentTypes(types);
}

// Payments
export function getPayments(): Payment[] {
  return getItem<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
}

export function setPayments(payments: Payment[]): void {
  setItem(STORAGE_KEYS.PAYMENTS, payments);
}

export function addPayment(payment: Payment): void {
  const payments = getPayments();
  payments.push(payment);
  setPayments(payments);
}

export function updatePayment(payment: Payment): void {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === payment.id);
  if (index !== -1) {
    payments[index] = payment;
    setPayments(payments);
  }
}

export function deletePayment(id: string): void {
  const payments = getPayments().filter(p => p.id !== id);
  setPayments(payments);
}

// Academic Years
export function getAcademicYears(): AcademicYear[] {
  return getItem<AcademicYear[]>(STORAGE_KEYS.ACADEMIC_YEARS, []);
}

export function setAcademicYears(years: AcademicYear[]): void {
  setItem(STORAGE_KEYS.ACADEMIC_YEARS, years);
}

export function addAcademicYear(year: AcademicYear): void {
  const years = getAcademicYears();
  // Set all others to inactive if this one is active
  if (year.isActive) {
    years.forEach(y => y.isActive = false);
  }
  years.push(year);
  setAcademicYears(years);
}

export function updateAcademicYear(year: AcademicYear): void {
  const years = getAcademicYears();
  // Set all others to inactive if this one is active
  if (year.isActive) {
    years.forEach(y => y.isActive = false);
  }
  const index = years.findIndex(y => y.id === year.id);
  if (index !== -1) {
    years[index] = year;
    setAcademicYears(years);
  }
}

export function getActiveAcademicYear(): AcademicYear | null {
  const years = getAcademicYears();
  return years.find(y => y.isActive) || null;
}

// School Info
export function getSchoolInfo(): SchoolInfo {
  return getItem<SchoolInfo>(STORAGE_KEYS.SCHOOL_INFO, {
    name: 'SMP Negeri 1',
    address: 'Jl. Pendidikan No. 1',
    phone: '021-12345678',
    email: 'info@smpn1.sch.id',
    principalName: 'Drs. Ahmad Sudirman, M.Pd',
    npsn: '12345678',
  });
}

export function setSchoolInfo(info: SchoolInfo): void {
  setItem(STORAGE_KEYS.SCHOOL_INFO, info);
}

// Check if initialized
export function isInitialized(): boolean {
  return getItem<boolean>(STORAGE_KEYS.INITIALIZED, false);
}

export function setInitialized(): void {
  setItem(STORAGE_KEYS.INITIALIZED, true);
}

// Reset all data
export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Export all data
export function exportAllData(): string {
  const data = {
    students: getStudents(),
    classes: getClasses(),
    paymentTypes: getPaymentTypes(),
    payments: getPayments(),
    academicYears: getAcademicYears(),
    schoolInfo: getSchoolInfo(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

// Import all data
export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.students) setStudents(data.students);
    if (data.classes) setClasses(data.classes);
    if (data.paymentTypes) setPaymentTypes(data.paymentTypes);
    if (data.payments) setPayments(data.payments);
    if (data.academicYears) setAcademicYears(data.academicYears);
    if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
    setInitialized();
    return true;
  } catch {
    return false;
  }
}

// Generate unique ID with better entropy
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate receipt number with better format
export function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `KWT/${year}${month}${day}/${random}`;
}

// Batch operations for better performance
export function batchUpdateStudents(updates: Partial<Student> & { id: string }[]): void {
  const students = getStudents();
  const updatedStudents = students.map(student => {
    const update = updates.find(u => u.id === student.id);
    if (update) {
      return { ...student, ...update, updatedAt: new Date().toISOString() };
    }
    return student;
  });
  setStudents(updatedStudents);
}

// Get statistics helper
export function getPaymentStats() {
  const payments = getPayments();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const thisMonth = payments.filter(p => {
    const date = new Date(p.paymentDate);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  const thisYear = payments.filter(p => p.year === currentYear);

  return {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    thisMonthPayments: thisMonth.length,
    thisMonthAmount: thisMonth.reduce((sum, p) => sum + p.amount, 0),
    thisYearPayments: thisYear.length,
    thisYearAmount: thisYear.reduce((sum, p) => sum + p.amount, 0),
  };
}
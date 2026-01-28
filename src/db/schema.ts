import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Academic years table
export const academicYears = sqliteTable('academic_years', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

// Classes table
export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  grade: integer('grade').notNull(),
  academicYearId: integer('academic_year_id').references(() => academicYears.id),
  createdAt: text('created_at').notNull(),
});

// Students table
export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nis: text('nis').notNull().unique(),
  nisn: text('nisn').notNull().unique(),
  name: text('name').notNull(),
  gender: text('gender').notNull(),
  classId: integer('class_id').references(() => classes.id),
  className: text('class_name').notNull(),
  birthPlace: text('birth_place').notNull(),
  birthDate: text('birth_date').notNull(),
  address: text('address').notNull(),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Payment types table
export const paymentTypes = sqliteTable('payment_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull(),
  allowInstallment: integer('allow_installment', { mode: 'boolean' }).notNull(),
  description: text('description'),
  fromMonth: integer('from_month'),
  fromYear: integer('from_year'),
  toMonth: integer('to_month'),
  toYear: integer('to_year'),
  createdAt: text('created_at').notNull(),
});

// Payments table
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => students.id).notNull(),
  studentName: text('student_name').notNull(),
  studentNis: text('student_nis').notNull(),
  className: text('class_name').notNull(),
  paymentTypeId: integer('payment_type_id').references(() => paymentTypes.id).notNull(),
  paymentTypeName: text('payment_type_name').notNull(),
  amount: integer('amount').notNull(),
  month: integer('month'),
  year: integer('year').notNull(),
  academicYearId: integer('academic_year_id').references(() => academicYears.id).notNull(),
  paymentDate: text('payment_date').notNull(),
  receiptNumber: text('receipt_number').notNull().unique(),
  paymentMethod: text('payment_method').notNull(),
  notes: text('notes'),
  createdBy: text('created_by').notNull().default('admin'),
  isInstallment: integer('is_installment', { mode: 'boolean' }).default(false),
  installmentOf: integer('installment_of'),
  installmentNumber: integer('installment_number'),
  totalInstallments: integer('total_installments'),
  isPaidOff: integer('is_paid_off', { mode: 'boolean' }).default(false),
  originalAmount: integer('original_amount'),
  remainingAmount: integer('remaining_amount'),
  createdAt: text('created_at').notNull(),
});

// School info table
export const schoolInfo = sqliteTable('school_info', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  principalName: text('principal_name').notNull(),
  npsn: text('npsn').notNull(),
  logo: text('logo'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Admin settings table
export const adminSettings = sqliteTable('admin_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().default('admin'),
  password: text('password').notNull().default('gorengan123'),
  appName: text('app_name').notNull().default('SPP Manager'),
  appLogo: text('app_logo'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
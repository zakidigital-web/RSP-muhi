-- Migration: Make NIS optional for students table
-- NISN remains required (NOT NULL + UNIQUE)
-- NIS becomes nullable (remove NOT NULL, keep UNIQUE)

-- Recreate students table with NIS nullable (SQLite doesn't support ALTER COLUMN)
CREATE TABLE IF NOT EXISTS `students_new` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `nis` text,
  `nisn` text NOT NULL,
  `name` text NOT NULL,
  `gender` text NOT NULL,
  `class_id` integer,
  `class_name` text NOT NULL,
  `birth_place` text NOT NULL,
  `birth_date` text NOT NULL,
  `address` text NOT NULL,
  `parent_name` text NOT NULL,
  `parent_phone` text NOT NULL,
  `status` text NOT NULL DEFAULT 'active',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- Copy data from old table
INSERT INTO `students_new` (`id`, `nis`, `nisn`, `name`, `gender`, `class_id`, `class_name`, `birth_place`, `birth_date`, `address`, `parent_name`, `parent_phone`, `status`, `created_at`, `updated_at`)
SELECT `id`, `nis`, `nisn`, `name`, `gender`, `class_id`, `class_name`, `birth_place`, `birth_date`, `address`, `parent_name`, `parent_phone`, `status`, `created_at`, `updated_at`
FROM `students`;

-- Drop old table
DROP TABLE `students`;

-- Rename new table
ALTER TABLE `students_new` RENAME TO `students`;

-- Recreate unique indexes (NISN must still be unique)
CREATE UNIQUE INDEX IF NOT EXISTS `students_nisn_unique` ON `students` (`nisn`);
CREATE UNIQUE INDEX IF NOT EXISTS `students_nis_unique` ON `students` (`nis`);

-- Make student_nis nullable in payments table
CREATE TABLE IF NOT EXISTS `payments_new` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `student_id` integer NOT NULL,
  `student_name` text NOT NULL,
  `student_nis` text,
  `class_name` text NOT NULL,
  `payment_type_id` integer NOT NULL,
  `payment_type_name` text NOT NULL,
  `amount` integer NOT NULL,
  `month` integer,
  `year` integer NOT NULL,
  `academic_year_id` integer NOT NULL,
  `payment_date` text NOT NULL,
  `receipt_number` text NOT NULL,
  `payment_method` text NOT NULL,
  `notes` text,
  `created_by` text NOT NULL DEFAULT 'admin',
  `is_installment` integer DEFAULT false,
  `installment_of` integer,
  `installment_number` integer,
  `total_installments` integer,
  `is_paid_off` integer DEFAULT false,
  `original_amount` integer,
  `remaining_amount` integer,
  `created_at` text NOT NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action
);

INSERT INTO `payments_new` (`id`, `student_id`, `student_name`, `student_nis`, `class_name`, `payment_type_id`, `payment_type_name`, `amount`, `month`, `year`, `academic_year_id`, `payment_date`, `receipt_number`, `payment_method`, `notes`, `created_by`, `is_installment`, `installment_of`, `installment_number`, `total_installments`, `is_paid_off`, `original_amount`, `remaining_amount`, `created_at`)
SELECT `id`, `student_id`, `student_name`, `student_nis`, `class_name`, `payment_type_id`, `payment_type_name`, `amount`, `month`, `year`, `academic_year_id`, `payment_date`, `receipt_number`, `payment_method`, `notes`, `created_by`, `is_installment`, `installment_of`, `installment_number`, `total_installments`, `is_paid_off`, `original_amount`, `remaining_amount`, `created_at`
FROM `payments`;

DROP TABLE `payments`;

ALTER TABLE `payments_new` RENAME TO `payments`;

CREATE UNIQUE INDEX IF NOT EXISTS `payments_receipt_number_unique` ON `payments` (`receipt_number`);

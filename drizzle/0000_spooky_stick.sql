CREATE TABLE `academic_years` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academic_years_name_unique` ON `academic_years` (`name`);--> statement-breakpoint
CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`grade` integer NOT NULL,
	`academic_year_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`is_recurring` integer NOT NULL,
	`allow_installment` integer NOT NULL,
	`description` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`student_name` text NOT NULL,
	`student_nis` text NOT NULL,
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
	`created_by` text DEFAULT 'admin' NOT NULL,
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
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_receipt_number_unique` ON `payments` (`receipt_number`);--> statement-breakpoint
CREATE TABLE `school_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`principal_name` text NOT NULL,
	`npsn` text NOT NULL,
	`logo` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nis` text NOT NULL,
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
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_nis_unique` ON `students` (`nis`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_nisn_unique` ON `students` (`nisn`);
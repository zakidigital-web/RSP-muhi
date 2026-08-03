-- Migration: Add multi-admin tables
-- admin_settings: app-level settings (app name, logo, login hint)
-- admin_users: multi-admin login support

CREATE TABLE IF NOT EXISTS `admin_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text DEFAULT 'admin' NOT NULL,
	`password` text DEFAULT 'gorengan123' NOT NULL,
	`app_name` text DEFAULT 'SPP Manager' NOT NULL,
	`app_logo` text,
	`show_login_hint` integer DEFAULT true,
	`login_hint_text` text DEFAULT 'Hubungi administrator untuk mendapatkan password.',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);

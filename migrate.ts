import 'dotenv/config';
import { getDb } from './src/db';
import { sql } from 'drizzle-orm';
import { adminUsers, adminSettings } from './src/db/schema';


async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Add columns to payment_types if they don't exist
    // SQLite doesn't have "IF NOT EXISTS" for ADD COLUMN in older versions, 
    // so we'll just try and catch errors
    const queries = [
      'ALTER TABLE payment_types ADD COLUMN from_month INTEGER',
      'ALTER TABLE payment_types ADD COLUMN from_year INTEGER',
      'ALTER TABLE payment_types ADD COLUMN to_month INTEGER',
      'ALTER TABLE payment_types ADD COLUMN to_year INTEGER',
    ];

    for (const q of queries) {
      try {
        await getDb().run(sql.raw(q));
        console.log(`Executed: ${q}`);
      } catch (e) {
        console.log(`Failed (likely already exists): ${q}`);
      }
    }

    // Ensure admin tables exist (multi-admin support)
    const adminTables = [
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        username text NOT NULL DEFAULT 'admin',
        password text NOT NULL DEFAULT 'gorengan123',
        app_name text NOT NULL DEFAULT 'SPP Manager',
        app_logo text,
        show_login_hint integer DEFAULT true,
        login_hint_text text DEFAULT 'Hubungi administrator untuk mendapatkan password.',
        created_at text NOT NULL,
        updated_at text NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS admin_users (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        password text NOT NULL,
        is_active integer NOT NULL DEFAULT true,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )`,
    ];

    for (const q of adminTables) {
      try {
        await getDb().run(sql.raw(q));
        console.log(`Created table: ${q.split('\n')[0].trim()}`);
      } catch (e) {
        console.log(`Failed to create table: ${e}`);
      }
    }

    // Seed default admin users if none exist
    const existingAdmins = await getDb().select().from(adminUsers);
    if (existingAdmins.length === 0) {
      const now = new Date().toISOString();
      await getDb().insert(adminUsers).values([
        { name: 'Admin 1', password: 'admin1234', isActive: true, createdAt: now, updatedAt: now },
        { name: 'Admin 2', password: 'admin5678', isActive: true, createdAt: now, updatedAt: now },
        { name: 'Admin 3', password: 'admin9012', isActive: true, createdAt: now, updatedAt: now },
      ]);
      console.log('Seeded 3 admin users (Admin 1, Admin 2, Admin 3).');
    } else {
      console.log(`Admin users already exist (${existingAdmins.length}), skipping seed.`);
    }

    // Seed default admin settings if none exist
    const existingSettings = await getDb().select().from(adminSettings);
    if (existingSettings.length === 0) {
      const now = new Date().toISOString();
      await getDb().insert(adminSettings).values({
        username: 'admin',
        password: 'gorengan123',
        appName: 'SPP Manager',
        showLoginHint: true,
        loginHintText: 'Hubungi administrator untuk mendapatkan password login.',
        createdAt: now,
        updatedAt: now,
      });
      console.log('Seeded default admin settings.');
    } else {
      console.log('Admin settings already exist, skipping.');
    }

    // Ensure there is at least one active academic year
    const activeYear = await getDb().run(sql`SELECT * FROM academic_years WHERE is_active = 1 LIMIT 1`);
    // @ts-ignore
    if (activeYear.rows && activeYear.rows.length === 0) {
      console.log('Inserting default active academic year...');
      await getDb().run(sql`
        INSERT INTO academic_years (name, start_date, end_date, is_active, created_at)
        VALUES ('2025/2026', '2025-07-01', '2026-06-30', 1, ${new Date().toISOString()})
      `);
    }

    console.log('Migration finished.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

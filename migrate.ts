import { getDb } from './src/db';
import { sql } from 'drizzle-orm';

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

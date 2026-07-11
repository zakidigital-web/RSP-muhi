import 'dotenv/config';
import { getDb } from './src/db';
import { adminUsers, adminSettings } from './src/db/schema';

async function seed() {
  try {
    console.log('Seeding admin users...');
    const db = getDb();
    const now = new Date().toISOString();

    // Check existing admin users
    const existing = await db.select().from(adminUsers);
    if (existing.length === 0) {
      await db.insert(adminUsers).values([
        { name: 'Admin 1', password: 'admin1234', isActive: true, createdAt: now, updatedAt: now },
        { name: 'Admin 2', password: 'admin5678', isActive: true, createdAt: now, updatedAt: now },
        { name: 'Admin 3', password: 'admin9012', isActive: true, createdAt: now, updatedAt: now },
      ]);
      console.log('✓ 3 admin users created (Admin 1, Admin 2, Admin 3)');
    } else {
      console.log(`✓ Admin users already exist (${existing.length} found), skipping seed`);
    }

    // Ensure admin_settings has hint columns
    const settings = await db.select().from(adminSettings).limit(1);
    if (settings.length === 0) {
      await db.insert(adminSettings).values({
        username: 'admin',
        password: 'gorengan123',
        appName: 'SPP Manager',
        showLoginHint: true,
        loginHintText: 'Hubungi administrator untuk mendapatkan password login.',
        createdAt: now,
        updatedAt: now,
      });
      console.log('✓ Default admin settings created');
    } else {
      console.log('✓ Admin settings already exist, skipping');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();

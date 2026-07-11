import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password wajib diisi' }, { status: 400 });
    }

    // Find matching active admin by password
    const db = getDb();
    const allAdmins = await db.select().from(adminUsers).where(eq(adminUsers.isActive, true));

    // Ensure there are default admins if table is empty
    if (allAdmins.length === 0) {
      const now = new Date().toISOString();
      await db.insert(adminUsers).values([
        { name: 'Admin 1', password: 'admin1234', isActive: true, createdAt: now, updatedAt: now },
        { name: 'Admin 2', password: 'admin5678', isActive: true, createdAt: now, updatedAt: now },
        { name: 'Admin 3', password: 'admin9012', isActive: true, createdAt: now, updatedAt: now },
      ]);
      // Try again after seeding
      const seeded = await db.select().from(adminUsers).where(eq(adminUsers.isActive, true));
      const matched = seeded.find((a) => a.password === password);
      if (matched) {
        return NextResponse.json({ success: true, adminId: matched.id, adminName: matched.name });
      }
    } else {
      const matched = allAdmins.find((a) => a.password === password);
      if (matched) {
        return NextResponse.json({ success: true, adminId: matched.id, adminName: matched.name });
      }
    }

    return NextResponse.json({ error: 'Password salah atau akun tidak aktif' }, { status: 401 });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

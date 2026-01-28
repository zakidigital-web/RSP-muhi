import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Fetch settings - table is guaranteed to exist by migration/setup
    const settings = await db.select().from(adminSettings).limit(1);
    
    if (!settings || settings.length === 0) {
      // Fallback if somehow empty
      const now = new Date().toISOString();
      const [newSettings] = await db.insert(adminSettings).values({
        username: 'admin',
        password: 'gorengan123',
        appName: 'SPP Manager',
        createdAt: now,
        updatedAt: now,
      }).returning();
      
      if (password === newSettings.password) {
        return NextResponse.json({ success: true });
      }
    } else if (password === settings[0].password) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

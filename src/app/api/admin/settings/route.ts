import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { adminSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    let settings = await getDb().select().from(adminSettings).limit(1);
    
    if (settings.length === 0) {
      const newSettings = await getDb().insert(adminSettings).values({
        username: 'admin',
        password: 'gorengan123',
        appName: 'SPP Manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      return NextResponse.json(newSettings[0]);
    }

    return NextResponse.json(settings[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, appName, appLogo } = body;

    let settings = await getDb().select().from(adminSettings).limit(1);
    
    if (settings.length === 0) {
      const newRecord = await getDb().insert(adminSettings).values({
        username: 'admin',
        password: password || 'gorengan123',
        appName: appName || 'SPP Manager',
        appLogo: appLogo || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      return NextResponse.json(newRecord[0]);
    } else {
      const updates: any = {
        updatedAt: new Date().toISOString(),
      };

      if (password) updates.password = password;
      if (appName) updates.appName = appName;
      if (appLogo !== undefined) updates.appLogo = appLogo;

      const updated = await getDb().update(adminSettings)
        .set(updates)
        .where(eq(adminSettings.id, settings[0].id))
        .returning();

      return NextResponse.json(updated[0]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

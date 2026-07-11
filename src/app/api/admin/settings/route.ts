import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { adminSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const runtime = 'nodejs';

const defaultSettings = {
  username: 'admin',
  password: 'gorengan123',
  appName: 'SPP Manager',
  appLogo: null,
  showLoginHint: true,
  loginHintText: 'Hubungi administrator untuk mendapatkan password.',
};

export async function GET(request: NextRequest) {
  try {
    let settings = await getDb().select().from(adminSettings).limit(1);

    if (settings.length === 0) {
      const now = new Date().toISOString();
      const newSettings = await getDb().insert(adminSettings).values({
        ...defaultSettings,
        createdAt: now,
        updatedAt: now,
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
    const { password, appName, appLogo, showLoginHint, loginHintText } = body;

    let settings = await getDb().select().from(adminSettings).limit(1);
    const now = new Date().toISOString();

    if (settings.length === 0) {
      const newRecord = await getDb().insert(adminSettings).values({
        username: 'admin',
        password: password || defaultSettings.password,
        appName: appName || defaultSettings.appName,
        appLogo: appLogo || null,
        showLoginHint: showLoginHint ?? defaultSettings.showLoginHint,
        loginHintText: loginHintText || defaultSettings.loginHintText,
        createdAt: now,
        updatedAt: now,
      }).returning();
      return NextResponse.json(newRecord[0]);
    } else {
      const updates: any = { updatedAt: now };

      if (password !== undefined) updates.password = password;
      if (appName !== undefined) updates.appName = appName;
      if (appLogo !== undefined) updates.appLogo = appLogo;
      if (showLoginHint !== undefined) updates.showLoginHint = showLoginHint;
      if (loginHintText !== undefined) updates.loginHintText = loginHintText;

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

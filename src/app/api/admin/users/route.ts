import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const runtime = 'nodejs';

// GET - list all admin users
export async function GET() {
  try {
    const users = await getDb().select().from(adminUsers).orderBy(adminUsers.id);
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password, isActive } = body;

    if (!name || !password) {
      return NextResponse.json({ error: 'Nama dan password wajib diisi' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const [newUser] = await getDb().insert(adminUsers).values({
      name,
      password,
      isActive: isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - update admin user
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    const body = await request.json();
    const updates: any = { updatedAt: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.password !== undefined) updates.password = body.password;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    const [updated] = await getDb()
      .update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, parseInt(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - delete admin user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    // Check total active admins — don't allow deleting if only 1 left
    const allUsers = await getDb().select().from(adminUsers);
    if (allUsers.length <= 1) {
      return NextResponse.json({ error: 'Minimal 1 admin harus ada' }, { status: 400 });
    }

    await getDb().delete(adminUsers).where(eq(adminUsers.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

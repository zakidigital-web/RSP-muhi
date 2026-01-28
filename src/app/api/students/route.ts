import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single student fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const student = await getDb()
        .select()
        .from(students)
        .where(eq(students.id, parseInt(id)))
        .limit(1);

      if (student.length === 0) {
        return NextResponse.json(
          { error: 'Student not found', code: 'STUDENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(student[0], { status: 200 });
    }

    // List with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const classId = searchParams.get('classId');

    let query = getDb().select().from(students);

    const conditions = [];

    // Filter by status
    if (status) {
      conditions.push(eq(students.status, status));
    }

    // Filter by classId
    if (classId) {
      if (isNaN(parseInt(classId))) {
        return NextResponse.json(
          { error: 'Valid classId is required', code: 'INVALID_CLASS_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(students.classId, parseInt(classId)));
    }

    // Search by name or nis
    if (search) {
      conditions.push(
        or(
          like(students.name, `%${search}%`),
          like(students.nis, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'nis',
      'nisn',
      'name',
      'gender',
      'className',
      'birthPlace',
      'birthDate',
      'address',
      'parentName',
      'parentPhone',
    ];

    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        return NextResponse.json(
          {
            error: `${field} is required`,
            code: 'MISSING_REQUIRED_FIELD',
          },
          { status: 400 }
        );
      }
    }

    // Validate gender
    if (body.gender !== 'L' && body.gender !== 'P') {
      return NextResponse.json(
        {
          error: 'Gender must be "L" or "P"',
          code: 'INVALID_GENDER',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !['active', 'inactive', 'graduated'].includes(body.status)) {
      return NextResponse.json(
        {
          error: 'Status must be "active", "inactive", or "graduated"',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Check for unique nis
    const existingNis = await getDb()
      .select()
      .from(students)
      .where(eq(students.nis, body.nis.trim()))
      .limit(1);

    if (existingNis.length > 0) {
      return NextResponse.json(
        {
          error: 'NIS already exists',
          code: 'DUPLICATE_NIS',
        },
        { status: 400 }
      );
    }

    // Check for unique nisn
    const existingNisn = await getDb()
      .select()
      .from(students)
      .where(eq(students.nisn, body.nisn.trim()))
      .limit(1);

    if (existingNisn.length > 0) {
      return NextResponse.json(
        {
          error: 'NISN already exists',
          code: 'DUPLICATE_NISN',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newStudent = await getDb()
      .insert(students)
      .values({
        nis: body.nis.trim(),
        nisn: body.nisn.trim(),
        name: body.name.trim(),
        gender: body.gender,
        classId: body.classId ? parseInt(body.classId) : null,
        className: body.className.trim(),
        birthPlace: body.birthPlace.trim(),
        birthDate: body.birthDate.trim(),
        address: body.address.trim(),
        parentName: body.parentName.trim(),
        parentPhone: body.parentPhone.trim(),
        status: body.status || 'active',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newStudent[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if student exists
    const existingStudent = await getDb()
      .select()
      .from(students)
      .where(eq(students.id, parseInt(id)))
      .limit(1);

    if (existingStudent.length === 0) {
      return NextResponse.json(
        { error: 'Student not found', code: 'STUDENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate gender if provided
    if (body.gender && body.gender !== 'L' && body.gender !== 'P') {
      return NextResponse.json(
        {
          error: 'Gender must be "L" or "P"',
          code: 'INVALID_GENDER',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !['active', 'inactive', 'graduated'].includes(body.status)) {
      return NextResponse.json(
        {
          error: 'Status must be "active", "inactive", or "graduated"',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Check for unique nis if updating
    if (body.nis) {
      const existingNis = await getDb()
        .select()
        .from(students)
        .where(eq(students.nis, body.nis.trim()))
        .limit(1);

      if (existingNis.length > 0 && existingNis[0].id !== parseInt(id)) {
        return NextResponse.json(
          {
            error: 'NIS already exists',
            code: 'DUPLICATE_NIS',
          },
          { status: 400 }
        );
      }
    }

    // Check for unique nisn if updating
    if (body.nisn) {
      const existingNisn = await getDb()
        .select()
        .from(students)
        .where(eq(students.nisn, body.nisn.trim()))
        .limit(1);

      if (existingNisn.length > 0 && existingNisn[0].id !== parseInt(id)) {
        return NextResponse.json(
          {
            error: 'NISN already exists',
            code: 'DUPLICATE_NISN',
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.nis !== undefined) updateData.nis = body.nis.trim();
    if (body.nisn !== undefined) updateData.nisn = body.nisn.trim();
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.classId !== undefined) updateData.classId = body.classId ? parseInt(body.classId) : null;
    if (body.className !== undefined) updateData.className = body.className.trim();
    if (body.birthPlace !== undefined) updateData.birthPlace = body.birthPlace.trim();
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate.trim();
    if (body.address !== undefined) updateData.address = body.address.trim();
    if (body.parentName !== undefined) updateData.parentName = body.parentName.trim();
    if (body.parentPhone !== undefined) updateData.parentPhone = body.parentPhone.trim();
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await getDb()
      .update(students)
      .set(updateData)
      .where(eq(students.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await getDb()
      .select()
      .from(students)
      .where(eq(students.id, parseInt(id)))
      .limit(1);

    if (existingStudent.length === 0) {
      return NextResponse.json(
        { error: 'Student not found', code: 'STUDENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await getDb()
      .delete(students)
      .where(eq(students.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Student deleted successfully',
        student: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

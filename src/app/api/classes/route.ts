import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { classes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await getDb()
        .select()
        .from(classes)
        .where(eq(classes.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Class not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const grade = searchParams.get('grade');
    const academicYearId = searchParams.get('academicYearId');

    let query = getDb().select().from(classes);

    // Build filter conditions
    const conditions = [];
    if (grade) {
      const gradeNum = parseInt(grade);
      if (!isNaN(gradeNum)) {
        conditions.push(eq(classes.grade, gradeNum));
      }
    }
    if (academicYearId) {
      const academicYearNum = parseInt(academicYearId);
      if (!isNaN(academicYearNum)) {
        conditions.push(eq(classes.academicYearId, academicYearNum));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

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
    const { name, grade, academicYearId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!grade) {
      return NextResponse.json(
        { error: 'Grade is required', code: 'MISSING_GRADE' },
        { status: 400 }
      );
    }

    // Validate grade value
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || ![7, 8, 9].includes(gradeNum)) {
      return NextResponse.json(
        { error: 'Grade must be 7, 8, or 9', code: 'INVALID_GRADE' },
        { status: 400 }
      );
    }

    // Validate academicYearId if provided
    let validAcademicYearId = null;
    if (academicYearId !== undefined && academicYearId !== null) {
      const academicYearNum = parseInt(academicYearId);
      if (isNaN(academicYearNum)) {
        return NextResponse.json(
          { error: 'Academic year ID must be a valid integer', code: 'INVALID_ACADEMIC_YEAR_ID' },
          { status: 400 }
        );
      }
      validAcademicYearId = academicYearNum;
    }

    // Create new class
    const newClass = await getDb()
      .insert(classes)
      .values({
        name: name.trim(),
        grade: gradeNum,
        academicYearId: validAcademicYearId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newClass[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, grade, academicYearId } = body;

    // Check if class exists
    const existingClass = await getDb()
      .select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existingClass.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (grade !== undefined) {
      const gradeNum = parseInt(grade);
      if (isNaN(gradeNum) || ![7, 8, 9].includes(gradeNum)) {
        return NextResponse.json(
          { error: 'Grade must be 7, 8, or 9', code: 'INVALID_GRADE' },
          { status: 400 }
        );
      }
      updates.grade = gradeNum;
    }

    if (academicYearId !== undefined) {
      if (academicYearId === null) {
        updates.academicYearId = null;
      } else {
        const academicYearNum = parseInt(academicYearId);
        if (isNaN(academicYearNum)) {
          return NextResponse.json(
            { error: 'Academic year ID must be a valid integer', code: 'INVALID_ACADEMIC_YEAR_ID' },
            { status: 400 }
          );
        }
        updates.academicYearId = academicYearNum;
      }
    }

    // Perform update
    const updated = await getDb()
      .update(classes)
      .set(updates)
      .where(eq(classes.id, parseInt(id)))
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await getDb()
      .select()
      .from(classes)
      .where(eq(classes.id, parseInt(id)))
      .limit(1);

    if (existingClass.length === 0) {
      return NextResponse.json(
        { error: 'Class not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete class
    const deleted = await getDb()
      .delete(classes)
      .where(eq(classes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Class deleted successfully',
        deletedClass: deleted[0],
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

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { academicYears } from '@/db/schema';
import { eq, ne, like, or, desc, and } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const academicYear = await getDb()
        .select()
        .from(academicYears)
        .where(eq(academicYears.id, parseInt(id)))
        .limit(1);

      if (academicYear.length === 0) {
        return NextResponse.json(
          { error: 'Academic year not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(academicYear[0], { status: 200 });
    }

    // List with pagination
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '50'),
      100
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = getDb().select().from(academicYears);

    if (search) {
      query = query.where(
        or(
          like(academicYears.name, `%${search}%`),
          like(academicYears.startDate, `%${search}%`),
          like(academicYears.endDate, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(academicYears.createdAt))
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
    const { name, startDate, endDate, isActive } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!startDate || typeof startDate !== 'string' || startDate.trim() === '') {
      return NextResponse.json(
        { error: 'Start date is required and must be a non-empty string', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    if (!endDate || typeof endDate !== 'string' || endDate.trim() === '') {
      return NextResponse.json(
        { error: 'End date is required and must be a non-empty string', code: 'MISSING_END_DATE' },
        { status: 400 }
      );
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingAcademicYear = await getDb()
      .select()
      .from(academicYears)
      .where(eq(academicYears.name, name.trim()))
      .limit(1);

    if (existingAcademicYear.length > 0) {
      return NextResponse.json(
        { error: 'Academic year with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

    const isActiveValue = isActive ?? false;

    // If isActive is true, set all other academic years to false
    if (isActiveValue === true) {
      await getDb()
        .update(academicYears)
        .set({ isActive: false })
        .where(eq(academicYears.isActive, true));
    }

    // Create new academic year
    const newAcademicYear = await getDb()
      .insert(academicYears)
      .values({
        name: name.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        isActive: isActiveValue,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newAcademicYear[0], { status: 201 });
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

    const academicYearId = parseInt(id);

    // Check if academic year exists
    const existingAcademicYear = await getDb()
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, academicYearId))
      .limit(1);

    if (existingAcademicYear.length === 0) {
      return NextResponse.json(
        { error: 'Academic year not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;

    // Validate isActive if provided
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    // Validate startDate if provided
    if (startDate !== undefined && (typeof startDate !== 'string' || startDate.trim() === '')) {
      return NextResponse.json(
        { error: 'Start date must be a non-empty string', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    // Validate endDate if provided
    if (endDate !== undefined && (typeof endDate !== 'string' || endDate.trim() === '')) {
      return NextResponse.json(
        { error: 'End date must be a non-empty string', code: 'INVALID_END_DATE' },
        { status: 400 }
      );
    }

    // Check if name is unique (if being updated)
    if (name !== undefined && name.trim() !== existingAcademicYear[0].name) {
      const duplicateName = await getDb()
        .select()
        .from(academicYears)
        .where(
          and(
            eq(academicYears.name, name.trim()),
            ne(academicYears.id, academicYearId)
          )
        )
        .limit(1);

      if (duplicateName.length > 0) {
        return NextResponse.json(
          { error: 'Academic year with this name already exists', code: 'DUPLICATE_NAME' },
          { status: 400 }
        );
      }
    }

    // If isActive is being set to true, set all other academic years to false
    if (isActive === true && existingAcademicYear[0].isActive === false) {
      await getDb()
        .update(academicYears)
        .set({ isActive: false })
        .where(ne(academicYears.id, academicYearId));
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (startDate !== undefined) updateData.startDate = startDate.trim();
    if (endDate !== undefined) updateData.endDate = endDate.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update academic year
    const updatedAcademicYear = await getDb()
      .update(academicYears)
      .set(updateData)
      .where(eq(academicYears.id, academicYearId))
      .returning();

    return NextResponse.json(updatedAcademicYear[0], { status: 200 });
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

    const academicYearId = parseInt(id);

    // Check if academic year exists
    const existingAcademicYear = await getDb()
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, academicYearId))
      .limit(1);

    if (existingAcademicYear.length === 0) {
      return NextResponse.json(
        { error: 'Academic year not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete academic year
    const deleted = await getDb()
      .delete(academicYears)
      .where(eq(academicYears.id, academicYearId))
      .returning();

    return NextResponse.json(
      {
        message: 'Academic year deleted successfully',
        deleted: deleted[0],
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

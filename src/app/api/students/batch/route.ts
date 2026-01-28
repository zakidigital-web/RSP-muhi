import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface StudentUpdate {
  id: number;
  classId?: number;
  className?: string;
  status?: string;
}

interface BatchUpdateRequest {
  updates: StudentUpdate[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchUpdateRequest = await request.json();

    // Validate updates array is provided
    if (!body.updates) {
      return NextResponse.json({
        error: 'Updates array is required',
        code: 'MISSING_UPDATES_ARRAY'
      }, { status: 400 });
    }

    // Validate updates is an array
    if (!Array.isArray(body.updates)) {
      return NextResponse.json({
        error: 'Updates must be an array',
        code: 'INVALID_UPDATES_TYPE'
      }, { status: 400 });
    }

    // Validate updates array is not empty
    if (body.updates.length === 0) {
      return NextResponse.json({
        error: 'Updates array cannot be empty',
        code: 'EMPTY_UPDATES_ARRAY'
      }, { status: 400 });
    }

    // Validate each update object
    for (let i = 0; i < body.updates.length; i++) {
      const update = body.updates[i];

      // Validate id field exists
      if (!update.id) {
        return NextResponse.json({
          error: `Update at index ${i} is missing required field: id`,
          code: 'MISSING_STUDENT_ID'
        }, { status: 400 });
      }

      // Validate id is a valid number
      if (typeof update.id !== 'number' || isNaN(update.id)) {
        return NextResponse.json({
          error: `Update at index ${i} has invalid id`,
          code: 'INVALID_STUDENT_ID'
        }, { status: 400 });
      }

      // Validate status if provided
      if (update.status !== undefined) {
        const validStatuses = ['active', 'inactive', 'graduated'];
        if (!validStatuses.includes(update.status)) {
          return NextResponse.json({
            error: `Update at index ${i} has invalid status. Must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS'
          }, { status: 400 });
        }
      }

      // Validate at least one field to update is provided
      if (update.classId === undefined && update.className === undefined && update.status === undefined) {
        return NextResponse.json({
          error: `Update at index ${i} must have at least one field to update (classId, className, or status)`,
          code: 'NO_FIELDS_TO_UPDATE'
        }, { status: 400 });
      }
    }

    // Process updates
    const updatedStudents = [];

    for (const update of body.updates) {
      // Check if student exists
      const existingStudent = await db.select()
        .from(students)
        .where(eq(students.id, update.id))
        .limit(1);

      if (existingStudent.length === 0) {
        return NextResponse.json({
          error: `Student not found with ID: ${update.id}`,
          code: 'STUDENT_NOT_FOUND',
          studentId: update.id
        }, { status: 404 });
      }

      // Prepare update data
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };

      if (update.classId !== undefined) {
        updateData.classId = update.classId;
      }

      if (update.className !== undefined) {
        updateData.className = update.className.trim();
      }

      if (update.status !== undefined) {
        updateData.status = update.status;
      }

      // Update student
      const updated = await db.update(students)
        .set(updateData)
        .where(eq(students.id, update.id))
        .returning();

      updatedStudents.push(updated[0]);
    }

    return NextResponse.json(updatedStudents, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
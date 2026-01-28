import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    // Validate studentId is a valid integer
    const parsedStudentId = parseInt(studentId);
    if (!studentId || isNaN(parsedStudentId)) {
      return NextResponse.json(
        { 
          error: 'Valid student ID is required',
          code: 'INVALID_STUDENT_ID'
        },
        { status: 400 }
      );
    }

    // Query payments for the specified student, ordered by paymentDate descending
    const studentPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.studentId, parsedStudentId))
      .orderBy(desc(payments.paymentDate));

    // Return empty array if no payments found (not 404)
    return NextResponse.json(studentPayments, { status: 200 });

  } catch (error) {
    console.error('GET payments by student error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
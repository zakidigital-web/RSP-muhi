import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { academicYears } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const activeAcademicYear = await getDb().select()
      .from(academicYears)
      .where(eq(academicYears.isActive, true))
      .limit(1);

    if (activeAcademicYear.length === 0) {
      return NextResponse.json(
        { 
          error: 'No active academic year found',
          code: 'NO_ACTIVE_ACADEMIC_YEAR' 
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json(activeAcademicYear[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      }, 
      { status: 500 }
    );
  }
}

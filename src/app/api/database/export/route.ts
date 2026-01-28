import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { academicYears, classes, students, paymentTypes, payments, schoolInfo } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database export...');
    
    // Query all records from each table
    const [
      academicYearsData,
      classesData,
      studentsData,
      paymentTypesData,
      paymentsData,
      schoolInfoData
    ] = await Promise.all([
      db.select().from(academicYears),
      db.select().from(classes),
      db.select().from(students),
      db.select().from(paymentTypes),
      db.select().from(payments),
      db.select().from(schoolInfo)
    ]);

    console.log('Export counts:', {
      academicYears: academicYearsData.length,
      classes: classesData.length,
      students: studentsData.length,
      paymentTypes: paymentTypesData.length,
      payments: paymentsData.length,
      schoolInfo: schoolInfoData.length
    });

    // Return exported data
    return NextResponse.json({
      success: true,
      data: {
        academicYears: academicYearsData,
        classes: classesData,
        students: studentsData,
        paymentTypes: paymentTypesData,
        payments: paymentsData,
        schoolInfo: schoolInfoData
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: academicYearsData.length + classesData.length + studentsData.length + 
                     paymentTypesData.length + paymentsData.length + schoolInfoData.length,
        version: '1.0'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to export database: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'EXPORT_ERROR'
    }, { status: 500 });
  }
}
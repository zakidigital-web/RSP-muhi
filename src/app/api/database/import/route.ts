import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { academicYears, classes, students, paymentTypes, payments, schoolInfo } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    // Validate that data object is provided
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ 
        error: "Data object is required in request body",
        code: "MISSING_DATA_OBJECT" 
      }, { status: 400 });
    }

    console.log('Starting database import...');
    
    // Delete all existing data in correct order (reverse of insertion order)
    console.log('Clearing existing data...');
    await db.delete(payments);
    await db.delete(students);
    await db.delete(paymentTypes);
    await db.delete(classes);
    await db.delete(academicYears);
    await db.delete(schoolInfo);

    // Reset autoincrement counters for clean slate
    try {
      await db.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('payments', 'students', 'payment_types', 'classes', 'academic_years', 'school_info')`);
    } catch (e) {
      console.log('Note: sqlite_sequence reset skipped (table might not exist yet)');
    }

    const imported = {
      academicYears: 0,
      classes: 0,
      students: 0,
      paymentTypes: 0,
      payments: 0,
      schoolInfo: 0
    };

    // ID mapping to handle foreign key relationships
    const idMaps: {
      academicYears: Map<number, number>;
      classes: Map<number, number>;
      students: Map<number, number>;
      paymentTypes: Map<number, number>;
    } = {
      academicYears: new Map(),
      classes: new Map(),
      students: new Map(),
      paymentTypes: new Map(),
    };

    // Import data in correct order to avoid foreign key constraints

    // 1. Academic Years (no dependencies)
    if (data.academicYears && Array.isArray(data.academicYears) && data.academicYears.length > 0) {
      console.log(`Importing ${data.academicYears.length} academic years...`);
      const batch = data.academicYears.map((item: any) => {
        const { id, ...dataWithoutId } = item;
        return dataWithoutId;
      });
      
      const results = await db.insert(academicYears).values(batch).returning();
      results.forEach((row, index) => {
        idMaps.academicYears.set(data.academicYears[index].id, row.id);
        imported.academicYears++;
      });
    }

    // 2. Classes (depends on academicYears)
    if (data.classes && Array.isArray(data.classes) && data.classes.length > 0) {
      console.log(`Importing ${data.classes.length} classes...`);
      const batch = data.classes.map((item: any) => {
        const { id, ...dataWithoutId } = item;
        if (dataWithoutId.academicYearId) {
          dataWithoutId.academicYearId = idMaps.academicYears.get(dataWithoutId.academicYearId) || null;
        }
        return dataWithoutId;
      });
      
      const results = await db.insert(classes).values(batch).returning();
      results.forEach((row, index) => {
        idMaps.classes.set(data.classes[index].id, row.id);
        imported.classes++;
      });
    }

    // 3. Payment Types (no dependencies)
    if (data.paymentTypes && Array.isArray(data.paymentTypes) && data.paymentTypes.length > 0) {
      console.log(`Importing ${data.paymentTypes.length} payment types...`);
      const batch = data.paymentTypes.map((item: any) => {
        const { id, ...dataWithoutId } = item;
        return dataWithoutId;
      });
      
      const results = await db.insert(paymentTypes).values(batch).returning();
      results.forEach((row, index) => {
        idMaps.paymentTypes.set(data.paymentTypes[index].id, row.id);
        imported.paymentTypes++;
      });
    }

    // 4. Students (depends on classes)
    if (data.students && Array.isArray(data.students) && data.students.length > 0) {
      console.log(`Importing ${data.students.length} students...`);
      const batchSize = 100; // Increased batch size
      for (let i = 0; i < data.students.length; i += batchSize) {
        const slice = data.students.slice(i, i + batchSize);
        const batch = slice.map((item: any) => {
          const { id, ...dataWithoutId } = item;
          if (dataWithoutId.classId) {
            dataWithoutId.classId = idMaps.classes.get(dataWithoutId.classId) || null;
          }
          return dataWithoutId;
        });
        const results = await db.insert(students).values(batch).returning();
        results.forEach((row, index) => {
          idMaps.students.set(slice[index].id, row.id);
          imported.students++;
        });
      }
    }

    // 5. Payments (depends on students, paymentTypes, academicYears)
    if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
      console.log(`Importing ${data.payments.length} payments...`);
      const batchSize = 200; // Increased batch size for payments
      for (let i = 0; i < data.payments.length; i += batchSize) {
        const batch = data.payments.slice(i, i + batchSize).map((item: any) => {
          const { id, ...dataWithoutId } = item;
          if (dataWithoutId.studentId) {
            dataWithoutId.studentId = idMaps.students.get(dataWithoutId.studentId) || dataWithoutId.studentId;
          }
          if (dataWithoutId.paymentTypeId) {
            dataWithoutId.paymentTypeId = idMaps.paymentTypes.get(dataWithoutId.paymentTypeId) || dataWithoutId.paymentTypeId;
          }
          if (dataWithoutId.academicYearId) {
            dataWithoutId.academicYearId = idMaps.academicYears.get(dataWithoutId.academicYearId) || dataWithoutId.academicYearId;
          }
          return dataWithoutId;
        });
        await db.insert(payments).values(batch);
        imported.payments += batch.length;
      }
    }

    // 6. School Info (no dependencies)
    if (data.schoolInfo && Array.isArray(data.schoolInfo) && data.schoolInfo.length > 0) {
      console.log(`Importing ${data.schoolInfo.length} school info records...`);
      await db.insert(schoolInfo).values(data.schoolInfo.map((item: any) => {
        const { id, ...dataWithoutId } = item;
        return dataWithoutId;
      }));
      imported.schoolInfo = data.schoolInfo.length;
    }

    console.log('Import completed successfully:', imported);

    return NextResponse.json({
      success: true,
      message: "Data imported successfully",
      imported
    }, { status: 200 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'IMPORT_ERROR'
    }, { status: 500 });
  }
}
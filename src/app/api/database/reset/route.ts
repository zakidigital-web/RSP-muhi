import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, students, classes, paymentTypes, academicYears, schoolInfo } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database reset...');
    
    const tablesCleared: string[] = [];
    const tablesFailed: Array<{ table: string; error: string }> = [];

    // Delete tables in correct order to avoid foreign key constraint errors
    const tablesToDelete = [
      { name: 'payments', table: payments },
      { name: 'students', table: students },
      { name: 'classes', table: classes },
      { name: 'paymentTypes', table: paymentTypes },
      { name: 'academicYears', table: academicYears },
      { name: 'schoolInfo', table: schoolInfo }
    ];

    // Delete from each table
    for (const { name, table } of tablesToDelete) {
      try {
        const result = await db.delete(table);
        tablesCleared.push(name);
        console.log(`✓ Successfully cleared table: ${name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Error clearing table ${name}:`, error);
        tablesFailed.push({ table: name, error: errorMessage });
      }
    }

    // Reset autoincrement counters for clean slate
    try {
      await db.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('payments', 'students', 'payment_types', 'classes', 'academic_years', 'school_info')`);
      console.log('✓ Reset autoincrement counters');
    } catch (error) {
      console.log('Note: sqlite_sequence reset skipped (table might not exist yet)');
    }

    // Check if any tables failed
    if (tablesFailed.length > 0) {
      console.error('Some tables failed:', tablesFailed);
      return NextResponse.json({
        success: false,
        message: 'Some tables failed to clear',
        tablesCleared,
        tablesFailed,
        error: `Failed to clear ${tablesFailed.length} table(s)`
      }, { status: 500 });
    }

    console.log('✓ Database reset completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'All data deleted successfully',
      tablesCleared,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to reset database: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'DATABASE_RESET_ERROR'
    }, { status: 500 });
  }
}
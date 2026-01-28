import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, paymentTypes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const academicYearId = searchParams.get('academicYearId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Build where conditions
    const conditions = [];
    if (academicYearId) {
      conditions.push(eq(payments.academicYearId, parseInt(academicYearId)));
    }
    if (year) {
      conditions.push(eq(payments.year, parseInt(year)));
    }
    if (month) {
      conditions.push(eq(payments.month, parseInt(month)));
    }

    // Get all payments with filters
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allPayments = whereClause
      ? await db.select().from(payments).where(whereClause)
      : await db.select().from(payments);

    // Calculate total amount and count
    const totalAmount = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = allPayments.length;

    // Calculate payments by method
    const byMethod = {
      cash: { count: 0, amount: 0 },
      transfer: { count: 0, amount: 0 },
      other: { count: 0, amount: 0 }
    };

    allPayments.forEach(payment => {
      const method = payment.paymentMethod.toLowerCase();
      if (method === 'cash') {
        byMethod.cash.count++;
        byMethod.cash.amount += payment.amount;
      } else if (method === 'transfer') {
        byMethod.transfer.count++;
        byMethod.transfer.amount += payment.amount;
      } else {
        byMethod.other.count++;
        byMethod.other.amount += payment.amount;
      }
    });

    // Calculate payments by payment type
    const paymentTypeMap = new Map<string, { count: number; amount: number }>();
    
    allPayments.forEach(payment => {
      const typeName = payment.paymentTypeName;
      if (!paymentTypeMap.has(typeName)) {
        paymentTypeMap.set(typeName, { count: 0, amount: 0 });
      }
      const typeData = paymentTypeMap.get(typeName)!;
      typeData.count++;
      typeData.amount += payment.amount;
    });

    const byPaymentType = Array.from(paymentTypeMap.entries()).map(([paymentTypeName, data]) => ({
      paymentTypeName,
      count: data.count,
      amount: data.amount
    }));

    // Build filters object
    const filters: { academicYearId?: number; year?: number; month?: number } = {};
    if (academicYearId) {
      filters.academicYearId = parseInt(academicYearId);
    }
    if (year) {
      filters.year = parseInt(year);
    }
    if (month) {
      filters.month = parseInt(month);
    }

    return NextResponse.json({
      totalAmount,
      totalPayments,
      byMethod,
      byPaymentType,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
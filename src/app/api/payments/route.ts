import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
export const runtime = 'nodejs';

// Helper function to generate receipt number
function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.floor(Math.random() * 900000) + 100000; // 6 digits: 100000-999999
  return `KWT/${dateStr}/${random}`;
}

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

      const record = await getDb()
        .select()
        .from(payments)
        .where(eq(payments.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Payment not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters and pagination
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '50'),
      100
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const studentId = searchParams.get('studentId');
    const paymentTypeId = searchParams.get('paymentTypeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const academicYearId = searchParams.get('academicYearId');

    let query = getDb().select().from(payments);

    // Build filter conditions
    const conditions = [];

    if (studentId) {
      const studentIdInt = parseInt(studentId);
      if (!isNaN(studentIdInt)) {
        conditions.push(eq(payments.studentId, studentIdInt));
      }
    }

    if (paymentTypeId) {
      const paymentTypeIdInt = parseInt(paymentTypeId);
      if (!isNaN(paymentTypeIdInt)) {
        conditions.push(eq(payments.paymentTypeId, paymentTypeIdInt));
      }
    }

    if (month) {
      const monthInt = parseInt(month);
      if (!isNaN(monthInt)) {
        conditions.push(eq(payments.month, monthInt));
      }
    }

    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        conditions.push(eq(payments.year, yearInt));
      }
    }

    if (academicYearId) {
      const academicYearIdInt = parseInt(academicYearId);
      if (!isNaN(academicYearIdInt)) {
        conditions.push(eq(payments.academicYearId, academicYearIdInt));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(payments.paymentDate), desc(payments.id)).limit(limit).offset(offset);

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
      'studentId',
      'studentName',
      'studentNis',
      'className',
      'paymentTypeId',
      'paymentTypeName',
      'amount',
      'year',
      'academicYearId',
      'paymentDate',
      'paymentMethod',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `${field} is required`,
            code: 'MISSING_REQUIRED_FIELD',
          },
          { status: 400 }
        );
      }
    }

    // Validate paymentMethod
    const validPaymentMethods = ['cash', 'transfer', 'other'];
    if (!validPaymentMethods.includes(body.paymentMethod)) {
      return NextResponse.json(
        {
          error: 'paymentMethod must be cash, transfer, or other',
          code: 'INVALID_PAYMENT_METHOD',
        },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        {
          error: 'amount must be a positive integer',
          code: 'INVALID_AMOUNT',
        },
        { status: 400 }
      );
    }

    // Validate month if provided
    if (body.month !== undefined && body.month !== null) {
      const monthInt = parseInt(body.month);
      if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
        return NextResponse.json(
          {
            error: 'month must be between 1 and 12',
            code: 'INVALID_MONTH',
          },
          { status: 400 }
        );
      }
    }

    // Generate receipt number
    const receiptNumber = generateReceiptNumber();

    // Prepare insert data
    const insertData = {
      studentId: body.studentId,
      studentName: body.studentName.trim(),
      studentNis: body.studentNis.trim(),
      className: body.className.trim(),
      paymentTypeId: body.paymentTypeId,
      paymentTypeName: body.paymentTypeName.trim(),
      amount: body.amount,
      month: body.month ?? null,
      year: body.year,
      academicYearId: body.academicYearId,
      paymentDate: body.paymentDate,
      receiptNumber,
      paymentMethod: body.paymentMethod,
      notes: body.notes ? body.notes.trim() : null,
      createdBy: body.createdBy ? body.createdBy.trim() : 'admin',
      isInstallment: body.isInstallment ?? false,
      installmentOf: body.installmentOf ?? null,
      installmentNumber: body.installmentNumber ?? null,
      totalInstallments: body.totalInstallments ?? null,
      isPaidOff: body.isPaidOff ?? false,
      originalAmount: body.originalAmount ?? null,
      remainingAmount: body.remainingAmount ?? null,
      createdAt: new Date().toISOString(),
    };

    const newPayment = await getDb()
      .insert(payments)
      .values(insertData)
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });
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

    const paymentId = parseInt(id);

    // Check if payment exists
    const existing = await getDb()
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate paymentMethod if provided
    if (body.paymentMethod) {
      const validPaymentMethods = ['cash', 'transfer', 'other'];
      if (!validPaymentMethods.includes(body.paymentMethod)) {
        return NextResponse.json(
          {
            error: 'paymentMethod must be cash, transfer, or other',
            code: 'INVALID_PAYMENT_METHOD',
          },
          { status: 400 }
        );
      }
    }

    // Validate amount if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        {
          error: 'amount must be a positive integer',
          code: 'INVALID_AMOUNT',
        },
        { status: 400 }
      );
    }

    // Validate month if provided
    if (body.month !== undefined && body.month !== null) {
      const monthInt = parseInt(body.month);
      if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
        return NextResponse.json(
          {
            error: 'month must be between 1 and 12',
            code: 'INVALID_MONTH',
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (body.studentId !== undefined) updateData.studentId = body.studentId;
    if (body.studentName !== undefined)
      updateData.studentName = body.studentName.trim();
    if (body.studentNis !== undefined)
      updateData.studentNis = body.studentNis.trim();
    if (body.className !== undefined)
      updateData.className = body.className.trim();
    if (body.paymentTypeId !== undefined)
      updateData.paymentTypeId = body.paymentTypeId;
    if (body.paymentTypeName !== undefined)
      updateData.paymentTypeName = body.paymentTypeName.trim();
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.month !== undefined) updateData.month = body.month;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.academicYearId !== undefined)
      updateData.academicYearId = body.academicYearId;
    if (body.paymentDate !== undefined)
      updateData.paymentDate = body.paymentDate;
    if (body.paymentMethod !== undefined)
      updateData.paymentMethod = body.paymentMethod;
    if (body.notes !== undefined)
      updateData.notes = body.notes ? body.notes.trim() : null;
    if (body.createdBy !== undefined)
      updateData.createdBy = body.createdBy.trim();
    if (body.isInstallment !== undefined)
      updateData.isInstallment = body.isInstallment;
    if (body.installmentOf !== undefined)
      updateData.installmentOf = body.installmentOf;
    if (body.installmentNumber !== undefined)
      updateData.installmentNumber = body.installmentNumber;
    if (body.totalInstallments !== undefined)
      updateData.totalInstallments = body.totalInstallments;
    if (body.isPaidOff !== undefined) updateData.isPaidOff = body.isPaidOff;
    if (body.originalAmount !== undefined)
      updateData.originalAmount = body.originalAmount;
    if (body.remainingAmount !== undefined)
      updateData.remainingAmount = body.remainingAmount;

    const updated = await getDb()
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, paymentId))
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

    const paymentId = parseInt(id);

    // Check if payment exists
    const existing = await getDb()
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await getDb()
      .delete(payments)
      .where(eq(payments.id, paymentId))
      .returning();

    return NextResponse.json(
      {
        message: 'Payment deleted successfully',
        payment: deleted[0],
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

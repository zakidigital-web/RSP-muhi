import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentTypes } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

      const paymentType = await db
        .select()
        .from(paymentTypes)
        .where(eq(paymentTypes.id, parseInt(id)))
        .limit(1);

      if (paymentType.length === 0) {
        return NextResponse.json(
          { error: 'Payment type not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(paymentType[0], { status: 200 });
    }

    // List with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db
      .select()
      .from(paymentTypes)
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
      const { 
        name, 
        amount, 
        isRecurring, 
        allowInstallment, 
        description,
        fromMonth,
        fromYear,
        toMonth,
        toYear
      } = body;
  
      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required', code: 'MISSING_NAME' },
          { status: 400 }
        );
      }
  
      if (amount === undefined || amount === null) {
        return NextResponse.json(
          { error: 'Amount is required', code: 'MISSING_AMOUNT' },
          { status: 400 }
        );
      }
  
      if (isRecurring === undefined || isRecurring === null) {
        return NextResponse.json(
          { error: 'isRecurring is required', code: 'MISSING_IS_RECURRING' },
          { status: 400 }
        );
      }
  
      if (allowInstallment === undefined || allowInstallment === null) {
        return NextResponse.json(
          { error: 'allowInstallment is required', code: 'MISSING_ALLOW_INSTALLMENT' },
          { status: 400 }
        );
      }
  
      // Validate amount is positive integer
      if (!Number.isInteger(amount) || amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive integer', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
  
      // Validate boolean types
      if (typeof isRecurring !== 'boolean') {
        return NextResponse.json(
          { error: 'isRecurring must be a boolean value', code: 'INVALID_IS_RECURRING' },
          { status: 400 }
        );
      }
  
      if (typeof allowInstallment !== 'boolean') {
        return NextResponse.json(
          { error: 'allowInstallment must be a boolean value', code: 'INVALID_ALLOW_INSTALLMENT' },
          { status: 400 }
        );
      }
  
      // Create new payment type
      const newPaymentType = await db
        .insert(paymentTypes)
        .values({
          name: name.trim(),
          amount,
          isRecurring,
          allowInstallment,
          description: description?.trim() || null,
          fromMonth: fromMonth || null,
          fromYear: fromYear || null,
          toMonth: toMonth || null,
          toYear: toYear || null,
          createdAt: new Date().toISOString(),
        })
        .returning();
  
      return NextResponse.json(newPaymentType[0], { status: 201 });
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
  
      // Validate ID
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }
  
      // Check if payment type exists
      const existingPaymentType = await db
        .select()
        .from(paymentTypes)
        .where(eq(paymentTypes.id, parseInt(id)))
        .limit(1);
  
      if (existingPaymentType.length === 0) {
        return NextResponse.json(
          { error: 'Payment type not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
  
      const body = await request.json();
      const { 
        name, 
        amount, 
        isRecurring, 
        allowInstallment, 
        description,
        fromMonth,
        fromYear,
        toMonth,
        toYear
      } = body;
  
      // Validate amount if provided
      if (amount !== undefined && amount !== null) {
        if (!Number.isInteger(amount) || amount <= 0) {
          return NextResponse.json(
            { error: 'Amount must be a positive integer', code: 'INVALID_AMOUNT' },
            { status: 400 }
          );
        }
      }
  
      // Validate boolean types if provided
      if (isRecurring !== undefined && typeof isRecurring !== 'boolean') {
        return NextResponse.json(
          { error: 'isRecurring must be a boolean value', code: 'INVALID_IS_RECURRING' },
          { status: 400 }
        );
      }
  
      if (allowInstallment !== undefined && typeof allowInstallment !== 'boolean') {
        return NextResponse.json(
          { error: 'allowInstallment must be a boolean value', code: 'INVALID_ALLOW_INSTALLMENT' },
          { status: 400 }
        );
      }
  
      // Build update object with only provided fields
      const updates: any = {};
      if (name !== undefined) updates.name = name.trim();
      if (amount !== undefined) updates.amount = amount;
      if (isRecurring !== undefined) updates.isRecurring = isRecurring;
      if (allowInstallment !== undefined) updates.allowInstallment = allowInstallment;
      if (description !== undefined) updates.description = description?.trim() || null;
      if (fromMonth !== undefined) updates.fromMonth = fromMonth;
      if (fromYear !== undefined) updates.fromYear = fromYear;
      if (toMonth !== undefined) updates.toMonth = toMonth;
      if (toYear !== undefined) updates.toYear = toYear;
  
      // Update payment type
      const updatedPaymentType = await db
        .update(paymentTypes)
        .set(updates)
        .where(eq(paymentTypes.id, parseInt(id)))
        .returning();
  
      return NextResponse.json(updatedPaymentType[0], { status: 200 });
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if payment type exists
    const existingPaymentType = await db
      .select()
      .from(paymentTypes)
      .where(eq(paymentTypes.id, parseInt(id)))
      .limit(1);

    if (existingPaymentType.length === 0) {
      return NextResponse.json(
        { error: 'Payment type not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete payment type
    const deleted = await db
      .delete(paymentTypes)
      .where(eq(paymentTypes.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Payment type deleted successfully',
        deletedPaymentType: deleted[0],
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
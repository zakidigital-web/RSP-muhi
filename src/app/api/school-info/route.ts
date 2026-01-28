import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { schoolInfo } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const record = await getDb().select()
      .from(schoolInfo)
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ 
        error: 'School info not found',
        code: 'SCHOOL_INFO_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(record[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, phone, email, principalName, npsn, logo } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'School name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!address) {
      return NextResponse.json({ 
        error: 'School address is required',
        code: 'MISSING_ADDRESS' 
      }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ 
        error: 'School phone is required',
        code: 'MISSING_PHONE' 
      }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ 
        error: 'School email is required',
        code: 'MISSING_EMAIL' 
      }, { status: 400 });
    }

    if (!principalName) {
      return NextResponse.json({ 
        error: 'Principal name is required',
        code: 'MISSING_PRINCIPAL_NAME' 
      }, { status: 400 });
    }

    if (!npsn) {
      return NextResponse.json({ 
        error: 'NPSN is required',
        code: 'MISSING_NPSN' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      principalName: principalName.trim(),
      npsn: npsn.trim(),
      logo: logo ? logo.trim() : null,
    };

    // Check if school info already exists
    const existingRecord = await getDb().select()
      .from(schoolInfo)
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      const updated = await getDb().update(schoolInfo)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schoolInfo.id, existingRecord[0].id))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // Create new record
      const newRecord = await getDb().insert(schoolInfo)
        .values({
          ...sanitizedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();

      return NextResponse.json(newRecord[0], { status: 200 });
    }
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, address, phone, email, principalName, npsn, logo } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL' 
        }, { status: 400 });
      }
    }

    // Check if record exists
    const existingRecord = await getDb().select()
      .from(schoolInfo)
      .where(eq(schoolInfo.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'School info not found',
        code: 'SCHOOL_INFO_NOT_FOUND' 
      }, { status: 404 });
    }

    // Build update object with sanitized data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name.trim();
    if (address !== undefined) updates.address = address.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (principalName !== undefined) updates.principalName = principalName.trim();
    if (npsn !== undefined) updates.npsn = npsn.trim();
    if (logo !== undefined) updates.logo = logo ? logo.trim() : null;

    // Update record
    const updated = await getDb().update(schoolInfo)
      .set(updates)
      .where(eq(schoolInfo.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { schoolInfo } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
export const runtime = 'nodejs';

async function ensureSchoolInfoSchema() {
  const db = getDb();
  const statements = [
    sql`ALTER TABLE school_info ADD COLUMN logo TEXT`,
    sql`ALTER TABLE school_info ADD COLUMN payment_section_name TEXT`,
    sql`ALTER TABLE school_info ADD COLUMN created_at TEXT`,
    sql`ALTER TABLE school_info ADD COLUMN updated_at TEXT`,
  ];
  for (const stmt of statements) {
    try {
      await db.run(stmt);
    } catch {
      // ignore if column already exists or alter not supported
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchoolInfoSchema();
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
    await ensureSchoolInfoSchema();
    const body = await request.json();
    const { name, address, phone, email, principalName, npsn, logo, paymentSectionName } = body;

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
      paymentSectionName: paymentSectionName ? String(paymentSectionName).trim() : null,
    };

    const existingRecord = await getDb().select().from(schoolInfo).limit(1);

    if (existingRecord.length > 0) {
      const now = new Date().toISOString();
      try {
        await getDb().run(sql`
          UPDATE school_info 
          SET 
            name = ${sanitizedData.name},
            address = ${sanitizedData.address},
            phone = ${sanitizedData.phone},
            email = ${sanitizedData.email},
            principal_name = ${sanitizedData.principalName},
            npsn = ${sanitizedData.npsn},
            logo = ${sanitizedData.logo},
            payment_section_name = ${sanitizedData.paymentSectionName},
            updated_at = ${now}
          WHERE id = ${existingRecord[0].id}
        `);
        return NextResponse.json({ ...existingRecord[0], ...sanitizedData, updatedAt: now }, { status: 200 });
      } catch {
        await getDb().run(sql`
          UPDATE school_info 
          SET 
            name = ${sanitizedData.name},
            address = ${sanitizedData.address},
            phone = ${sanitizedData.phone},
            email = ${sanitizedData.email},
            principal_name = ${sanitizedData.principalName},
            npsn = ${sanitizedData.npsn}
          WHERE id = ${existingRecord[0].id}
        `);
        return NextResponse.json({ ...existingRecord[0], ...sanitizedData }, { status: 200 });
      }
    } else {
      const now = new Date().toISOString();
      try {
        await getDb().run(sql`
          INSERT INTO school_info 
            (name, address, phone, email, principal_name, npsn, logo, payment_section_name, created_at, updated_at)
          VALUES 
            (${sanitizedData.name}, ${sanitizedData.address}, ${sanitizedData.phone}, ${sanitizedData.email}, ${sanitizedData.principalName}, ${sanitizedData.npsn}, ${sanitizedData.logo}, ${sanitizedData.paymentSectionName}, ${now}, ${now})
        `);
        return NextResponse.json({ ...sanitizedData, createdAt: now, updatedAt: now }, { status: 200 });
      } catch {
        await getDb().run(sql`
          INSERT INTO school_info 
            (name, address, phone, email, principal_name, npsn)
          VALUES 
            (${sanitizedData.name}, ${sanitizedData.address}, ${sanitizedData.phone}, ${sanitizedData.email}, ${sanitizedData.principalName}, ${sanitizedData.npsn})
        `);
        return NextResponse.json(sanitizedData, { status: 200 });
      }
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
    await ensureSchoolInfoSchema();
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
    const { name, address, phone, email, principalName, npsn, logo, paymentSectionName } = body;

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
    if (paymentSectionName !== undefined) updates.paymentSectionName = paymentSectionName ? String(paymentSectionName).trim() : null;

    try {
      await getDb().run(sql`
        UPDATE school_info 
        SET 
          name = COALESCE(${updates.name}, name),
          address = COALESCE(${updates.address}, address),
          phone = COALESCE(${updates.phone}, phone),
          email = COALESCE(${updates.email}, email),
          principal_name = COALESCE(${updates.principalName}, principal_name),
          npsn = COALESCE(${updates.npsn}, npsn),
          logo = ${updates.logo},
          payment_section_name = ${updates.paymentSectionName},
          updated_at = ${updates.updatedAt}
        WHERE id = ${parseInt(id)}
      `);
      return NextResponse.json({ ...existingRecord[0], ...updates }, { status: 200 });
    } catch {
      await getDb().run(sql`
        UPDATE school_info 
        SET 
          name = COALESCE(${updates.name}, name),
          address = COALESCE(${updates.address}, address),
          phone = COALESCE(${updates.phone}, phone),
          email = COALESCE(${updates.email}, email),
          principal_name = COALESCE(${updates.principalName}, principal_name),
          npsn = COALESCE(${updates.npsn}, npsn)
        WHERE id = ${parseInt(id)}
      `);
      return NextResponse.json({ ...existingRecord[0], ...updates }, { status: 200 });
    }
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

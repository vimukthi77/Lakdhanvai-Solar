import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tanker from '@/models/Tanker';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);

    // Check if user has Gate Security role
    if (decodedToken.role !== UserRole.GATE_SECURITY) {
      return NextResponse.json(
        { success: false, error: 'Only Gate Security can create tanker entries' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      invoiceNo,
      orderReference,
      productType,
      quantityLiters,
      vehicleNo,
      invoiceImage,
    } = body;

    // Validate required fields
    if (!invoiceNo || !orderReference || !productType || !quantityLiters || !vehicleNo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: invoiceNo, orderReference, productType, quantityLiters, vehicleNo',
        },
        { status: 400 }
      );
    }

    // Check if invoice already exists
    const existingTanker = await Tanker.findOne({ invoiceNo });
    if (existingTanker) {
      return NextResponse.json(
        { success: false, error: 'Tanker with this invoice number already exists' },
        { status: 409 }
      );
    }

    // Create new tanker entry
    const newTanker = await Tanker.create({
      invoiceNo,
      orderReference,
      productType,
      quantityLiters,
      vehicleNo,
      invoiceImage,
      status: 'PENDING_SAFETY',
      createdBy: decodedToken.userId,
      startPumpReading: 0,
      endPumpReading: 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: newTanker,
        message: 'Tanker entry created successfully. Awaiting safety check.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Tanker entry error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while creating tanker entry',
      },
      { status: 500 }
    );
  }
}

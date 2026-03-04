import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tanker from '@/models/Tanker';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/lib/constants';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if user has Safety Officer role
    if (decodedToken.role !== UserRole.SAFETY_OFFICER) {
      return NextResponse.json(
        { success: false, error: 'Only Safety Officer can perform safety checks' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { safetyStatus, safetyNotes } = body;

    // Validate input
    if (!safetyStatus || !['PASSED', 'FAILED'].includes(safetyStatus)) {
      return NextResponse.json(
        { success: false, error: 'safetyStatus must be either PASSED or FAILED' },
        { status: 400 }
      );
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tanker ID' },
        { status: 400 }
      );
    }

    // Find and update tanker
    const tanker = await Tanker.findById(id);

    if (!tanker) {
      return NextResponse.json(
        { success: false, error: 'Tanker not found' },
        { status: 404 }
      );
    }

    // Update safety check
    tanker.safetyCheckedBy = new mongoose.Types.ObjectId(decodedToken.userId);
    tanker.safetyCheckDate = new Date();
    tanker.safetyStatus = safetyStatus;
    tanker.safetyNotes = safetyNotes || '';

    // Update status based on safety check result
    if (safetyStatus === 'PASSED') {
      tanker.status = 'READY_TO_UNLOAD';
    } else if (safetyStatus === 'FAILED') {
      tanker.status = 'REJECTED';
    }

    await tanker.save();

    return NextResponse.json(
      {
        success: true,
        data: tanker,
        message: `Safety check marked as ${safetyStatus}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Safety check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while updating safety check',
      },
      { status: 500 }
    );
  }
}

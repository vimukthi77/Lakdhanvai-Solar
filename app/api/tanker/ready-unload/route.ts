import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tanker from '@/models/Tanker';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/lib/constants';

export async function GET(request: NextRequest) {
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

    // Check if user has Unloading Operator role
    if (decodedToken.role !== UserRole.UNLOADING_OPERATOR) {
      return NextResponse.json(
        { success: false, error: 'Only Unloading Operator can view ready-to-unload tankers' },
        { status: 403 }
      );
    }

    // Get all tankers ready for unloading
    const tankers = await Tanker.find({
      status: 'READY_TO_UNLOAD',
    })
      .populate('createdBy', 'name email')
      .populate('safetyCheckedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: tankers,
        count: tankers.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch ready-unload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while fetching tankers',
      },
      { status: 500 }
    );
  }
}

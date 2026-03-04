import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UnloadLog from '@/models/UnloadLog';
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

    // Check if user is Admin
    if (decodedToken.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Only Admin can access fuel records' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const productType = searchParams.get('productType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (productType) {
      filter.productType = productType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await UnloadLog.countDocuments(filter);

    // Get records with pagination
    const records = await UnloadLog.find(filter)
      .populate('tankerId', 'invoiceNo vehicleNo')
      .populate('operatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate stats from records
    const totalDieselDelivered = records.reduce(
      (sum, record) => sum + record.netDelivered,
      0
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          records: records.map((record) => ({
            _id: record._id,
            invoiceNo: record.tankerId?.invoiceNo,
            vehicleNo: record.tankerId?.vehicleNo,
            operatorName: record.operatorId?.name,
            productType: record.productType,
            bayNumber: record.bayNumber,
            netDelivered: record.netDelivered,
            startTime: record.startTime,
            endTime: record.endTime,
            duration: Math.round(
              (record.endTime.getTime() - record.startTime.getTime()) / 60000
            ), // minutes
            notes: record.notes,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          summary: {
            totalRecords: records.length,
            totalDieselDelivered: parseFloat(totalDieselDelivered.toFixed(2)),
            averageDelivery: parseFloat(
              (totalDieselDelivered / records.length).toFixed(2)
            ),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch records error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while fetching records',
      },
      { status: 500 }
    );
  }
}

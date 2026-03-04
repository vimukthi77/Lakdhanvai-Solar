import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tanker from '@/models/Tanker';
import UnloadLog from '@/models/UnloadLog';
import SolarMetric from '@/models/SolarMetric';
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

    // Check if user has Unloading Operator role
    if (decodedToken.role !== UserRole.UNLOADING_OPERATOR) {
      return NextResponse.json(
        { success: false, error: 'Only Unloading Operator can record unloading' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      startPumpReading,
      endPumpReading,
      bayNumber,
      notes,
    } = body;

    // Validate input
    if (
      startPumpReading === undefined ||
      endPumpReading === undefined ||
      !bayNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: startPumpReading, endPumpReading, bayNumber',
        },
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

    // Validate readings
    if (endPumpReading <= startPumpReading) {
      return NextResponse.json(
        { success: false, error: 'End pump reading must be greater than start pump reading' },
        { status: 400 }
      );
    }

    // Find tanker
    const tanker = await Tanker.findById(id);

    if (!tanker) {
      return NextResponse.json(
        { success: false, error: 'Tanker not found' },
        { status: 404 }
      );
    }

    if (tanker.status !== 'READY_TO_UNLOAD') {
      return NextResponse.json(
        { success: false, error: 'Tanker is not ready for unloading' },
        { status: 400 }
      );
    }

    // Calculate net delivered
    const netDelivered = endPumpReading - startPumpReading;

    // Update tanker
    tanker.unloadedBy = new mongoose.Types.ObjectId(decodedToken.userId);
    tanker.startPumpReading = startPumpReading;
    tanker.endPumpReading = endPumpReading;
    tanker.netDelivered = netDelivered;
    tanker.unloadDate = new Date();
    tanker.bayNumber = bayNumber;
    tanker.status = 'COMPLETED';

    await tanker.save();

    // Create unload log
    const unloadLog = await UnloadLog.create({
      tankerId: new mongoose.Types.ObjectId(id),
      operatorId: new mongoose.Types.ObjectId(decodedToken.userId),
      startTime: new Date(),
      endTime: new Date(),
      startPumpReading,
      endPumpReading,
      netDelivered,
      productType: tanker.productType,
      bayNumber,
      notes: notes || '',
    });

    // Update solar metrics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let solarMetric = await SolarMetric.findOne({ date: today });

    if (solarMetric) {
      solarMetric.totalDieselReceived += netDelivered;
      solarMetric.currentStockLevel += netDelivered;
      await solarMetric.save();
    } else {
      // Create new metric for today
      const dieselSavedLiters = 0; // Will be calculated from solar data
      const costSavings = 0; // Will be calculated from solar data

      await SolarMetric.create({
        date: today,
        totalDieselReceived: netDelivered,
        currentStockLevel: netDelivered,
        fuelUsedToday: 0,
        solarKwh: 0,
        dieselSavedLiters,
        costSavings,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          tanker,
          unloadLog,
          netDelivered,
        },
        message: `Unloading completed. Net delivered: ${netDelivered} liters`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while recording unloading',
      },
      { status: 500 }
    );
  }
}

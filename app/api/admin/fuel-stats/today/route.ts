import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tanker from '@/models/Tanker';
import SolarMetric from '@/models/SolarMetric';
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
        { success: false, error: 'Only Admin can access fuel statistics' },
        { status: 403 }
      );
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all completed tankers from today
    const completedTankers = await Tanker.find({
      status: 'COMPLETED',
      unloadDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Calculate total diesel received
    const totalDieselReceived = completedTankers.reduce(
      (sum, tanker) => sum + (tanker.netDelivered || 0),
      0
    );

    // Get or create solar metric for today
    let solarMetric = await SolarMetric.findOne({ date: today });

    if (!solarMetric) {
      solarMetric = await SolarMetric.create({
        date: today,
        totalDieselReceived,
        currentStockLevel: 0,
        fuelUsedToday: 0,
        solarKwh: 0,
        dieselSavedLiters: 0,
        costSavings: 0,
      });
    } else {
      // Update the metric with latest data
      solarMetric.totalDieselReceived = totalDieselReceived;
      await solarMetric.save();
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          date: today.toISOString().split('T')[0],
          totalDieselReceived,
          tankerCount: completedTankers.length,
          solarMetric: {
            solarKwh: solarMetric.solarKwh,
            dieselSavedLiters: solarMetric.dieselSavedLiters,
            costSavings: solarMetric.costSavings,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch today stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while fetching statistics',
      },
      { status: 500 }
    );
  }
}

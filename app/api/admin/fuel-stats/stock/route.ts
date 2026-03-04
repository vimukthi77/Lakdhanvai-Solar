import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
        { success: false, error: 'Only Admin can access stock status' },
        { status: 403 }
      );
    }

    // Get today's metric
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let solarMetric = await SolarMetric.findOne({ date: today });

    if (!solarMetric) {
      solarMetric = await SolarMetric.create({
        date: today,
        totalDieselReceived: 0,
        currentStockLevel: 0,
        fuelUsedToday: 0,
        solarKwh: 0,
        dieselSavedLiters: 0,
        costSavings: 0,
      });
    }

    // Get last 7 days metrics for trend
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekMetrics = await SolarMetric.find({
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: 1 });

    // Calculate trend
    const trend = weekMetrics.map((metric) => ({
      date: metric.date.toISOString().split('T')[0],
      stock: metric.currentStockLevel,
      received: metric.totalDieselReceived,
      used: metric.fuelUsedToday,
    }));

    const maxCapacity = 50000; // Assuming 50,000 liters capacity
    const stockPercentage = Math.round(
      (solarMetric.currentStockLevel / maxCapacity) * 100
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          currentStock: solarMetric.currentStockLevel,
          maxCapacity,
          percentage: Math.min(stockPercentage, 100), // Cap at 100%
          status:
            stockPercentage > 75
              ? 'High'
              : stockPercentage > 50
                ? 'Good'
                : stockPercentage > 25
                  ? 'Low'
                  : 'Critical',
          trend,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch stock status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while fetching stock status',
      },
      { status: 500 }
    );
  }
}

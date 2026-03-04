import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SolarMetric from '@/models/SolarMetric';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/lib/constants';

// Constants
const DIESEL_SAVED_PER_KWH = 0.199; // liters
const COST_PER_KWH = 56.35; // LKR

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
        { success: false, error: 'Only Admin can access solar savings' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get metrics for period
    const metrics = await SolarMetric.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate totals
    const totalSolarKwh = metrics.reduce((sum, m) => sum + m.solarKwh, 0);
    const totalDieselSaved = totalSolarKwh * DIESEL_SAVED_PER_KWH;
    const totalCostSavings = totalSolarKwh * COST_PER_KWH;

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMetric = metrics.find(
      (m) => m.date.toDateString() === today.toDateString()
    );

    // Get trend data
    const trend = metrics.map((metric) => ({
      date: metric.date.toISOString().split('T')[0],
      solarKwh: parseFloat(metric.solarKwh.toFixed(2)),
      dieselSaved: parseFloat((metric.solarKwh * DIESEL_SAVED_PER_KWH).toFixed(2)),
      costSavings: parseFloat((metric.solarKwh * COST_PER_KWH).toFixed(2)),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          period: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            days,
          },
          totals: {
            solarKwh: parseFloat(totalSolarKwh.toFixed(2)),
            dieselSavedLiters: parseFloat(totalDieselSaved.toFixed(2)),
            costSavingsLKR: parseFloat(totalCostSavings.toFixed(2)),
          },
          today: todayMetric
            ? {
                date: todayMetric.date.toISOString().split('T')[0],
                solarKwh: parseFloat(todayMetric.solarKwh.toFixed(2)),
                dieselSaved: parseFloat(
                  (todayMetric.solarKwh * DIESEL_SAVED_PER_KWH).toFixed(2)
                ),
                costSavings: parseFloat(
                  (todayMetric.solarKwh * COST_PER_KWH).toFixed(2)
                ),
              }
            : null,
          trend,
          dailyAverage: {
            solarKwh: parseFloat((totalSolarKwh / metrics.length).toFixed(2)),
            dieselSaved: parseFloat(
              ((totalSolarKwh / metrics.length) * DIESEL_SAVED_PER_KWH).toFixed(2)
            ),
            costSavings: parseFloat(
              ((totalSolarKwh / metrics.length) * COST_PER_KWH).toFixed(2)
            ),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch solar savings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while fetching solar savings',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
        { success: false, error: 'Only Admin can update solar savings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { date, solarKwh } = body;

    if (!date || solarKwh === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, solarKwh' },
        { status: 400 }
      );
    }

    // Parse date
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    // Update or create metric
    const metric = await SolarMetric.findOneAndUpdate(
      { date: metricDate },
      {
        solarKwh,
        dieselSavedLiters: solarKwh * DIESEL_SAVED_PER_KWH,
        costSavings: solarKwh * COST_PER_KWH,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: metric,
        message: 'Solar metrics updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update solar savings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while updating solar savings',
      },
      { status: 500 }
    );
  }
}

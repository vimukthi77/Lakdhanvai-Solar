import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prediction from '@/models/Prediction';

// GET - Fetch predictions with optional date range filtering
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const date = searchParams.get('date');
        const limit = parseInt(searchParams.get('limit') || '50');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            query.date = { $gte: startDate };
        } else if (endDate) {
            query.date = { $lte: endDate };
        }

        const predictions = await Prediction.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ predictions, count: predictions.length });
    } catch (error) {
        console.error('Error fetching predictions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch predictions' },
            { status: 500 }
        );
    }
}

// POST - Save a new prediction
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { date, startHour, endHour, totalKw, totalSavings, breakdown } = body;

        if (!date || startHour === undefined || endHour === undefined) {
            return NextResponse.json(
                { error: 'Date, startHour, and endHour are required' },
                { status: 400 }
            );
        }

        const prediction = await Prediction.create({
            date,
            startHour,
            endHour,
            totalKw: totalKw || 0,
            totalSavings: totalSavings || 0,
            breakdown: breakdown || [],
        });

        return NextResponse.json({
            message: 'Prediction saved successfully',
            prediction,
        }, { status: 201 });
    } catch (error) {
        console.error('Error saving prediction:', error);
        return NextResponse.json(
            { error: 'Failed to save prediction' },
            { status: 500 }
        );
    }
}

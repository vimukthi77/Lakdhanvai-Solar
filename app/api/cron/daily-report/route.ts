import { NextRequest, NextResponse } from 'next/server';
import { sendPredictionEmail } from '@/lib/email';
import { sendPredictionSMS } from '@/lib/sms';

// This endpoint will be called by a cron job at 2 PM daily
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const displayDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Fetch prediction from AI model
    const predictionResponse = await fetch(
      'https://solar-ai-model.onrender.com/predict_range',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          start_hour: 6,
          end_hour: 18,
        }),
      }
    );

    if (!predictionResponse.ok) {
      throw new Error('Failed to fetch prediction');
    }

    const prediction = await predictionResponse.json();

    // Find peak hour
    const peakHour = prediction.breakdown.reduce(
      (max: any, item: any) =>
        item.predicted_kw > max.predicted_kw ? item : max,
      prediction.breakdown[0]
    );

    // Calculate average temperature
    const avgTemp = Math.round(
      prediction.breakdown.reduce(
        (sum: number, item: any) => sum + item.predicted_temp,
        0
      ) / prediction.breakdown.length
    );

    // Prepare email data
    const emailData = {
      date: displayDate,
      totalKw: prediction.total_kw,
      totalSavings: prediction.total_savings,
      peakHour: peakHour.hour,
      peakKw: peakHour.predicted_kw,
      avgTemp: avgTemp,
      breakdown: prediction.breakdown,
    };

    // Send email
    const emailSent = await sendPredictionEmail(emailData);

    // Prepare SMS data
    const smsData = {
      date: displayDate,
      totalKw: prediction.total_kw,
      totalSavings: prediction.total_savings,
      peakHour: peakHour.hour,
      peakKw: peakHour.predicted_kw,
    };

    // Send SMS
    const smsSent = await sendPredictionSMS(smsData);

    return NextResponse.json({
      success: true,
      emailSent,
      smsSent,
      date: displayDate,
      prediction: {
        totalKw: prediction.total_kw,
        totalSavings: prediction.total_savings,
      },
    });
  } catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send daily report' },
      { status: 500 }
    );
  }
}
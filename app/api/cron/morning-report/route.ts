import { NextRequest, NextResponse } from 'next/server';
import { sendPredictionEmail } from '@/lib/email';
import { sendPredictionSMS, SMSData } from '@/lib/sms';

// GET/POST - Morning Report (8 AM Daily)
export async function GET(request: NextRequest) {
  return handleMorningReport(request);
}

export async function POST(request: NextRequest) {
  return handleMorningReport(request);
}

async function handleMorningReport(request: NextRequest) {
  try {
    // Optional: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Skip auth check for manual triggers
    const isManualTrigger = request.method === 'POST';
    
    if (!isManualTrigger && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
    const shortDate = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Fetch REAL prediction from AI model
    
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
      throw new Error(`AI Model Error: ${predictionResponse.status}`);
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

    // Prepare SMS data
    const smsData: SMSData = {
      date: shortDate,
      totalKw: prediction.total_kw,
      totalSavings: prediction.total_savings,
      peakHour: peakHour.hour,
      peakKw: peakHour.predicted_kw,
      avgTemp: avgTemp,
      hoursCount: prediction.breakdown.length,
    };

    // Prepare Email data
    const emailData = {
      date: displayDate,
      totalKw: prediction.total_kw,
      totalSavings: prediction.total_savings,
      peakHour: peakHour.hour,
      peakKw: peakHour.predicted_kw,
      avgTemp: avgTemp,
      breakdown: prediction.breakdown,
    };

    // Send SMS
    let smsSent = false;
    try {
      smsSent = await sendPredictionSMS(smsData, 'short');
    } catch (smsError) {
      // SMS error handled silently
    }

    // Send Email
    let emailSent = false;
    try {
      emailSent = await sendPredictionEmail(emailData);
    } catch (emailError) {
      // Email error handled silently
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      date: displayDate,
      notifications: {
        sms: smsSent,
        email: emailSent,
      },
      prediction: {
        totalKw: prediction.total_kw,
        totalSavings: prediction.total_savings,
        peakHour: peakHour.hour,
        peakKw: peakHour.predicted_kw,
        avgTemp: avgTemp,
        hours: prediction.breakdown.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send morning report',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
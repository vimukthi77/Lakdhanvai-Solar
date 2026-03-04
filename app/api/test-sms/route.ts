import { NextResponse } from 'next/server';
import { sendTestSMS, fetchAndSendPredictionSMS } from '@/lib/sms';

// GET - Send simple test SMS
export async function GET() {
  try {
    const result = await sendTestSMS();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      phone: '0750569545',
      type: 'test',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// POST - Send REAL prediction SMS from AI model
export async function POST() {
  try {
    const result = await fetchAndSendPredictionSMS();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      phone: '0750569545',
      type: 'real_prediction',
      prediction: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
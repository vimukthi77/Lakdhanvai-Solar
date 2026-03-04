import { NextRequest, NextResponse } from 'next/server';
import { 
  sendTestSMS, 
  sendPredictionSMS, 
  sendCustomSMS,
  checkSMSBalance 
} from '@/lib/sms';

// POST - Send SMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, message, phone } = body;

    // Test SMS
    if (type === 'test') {
      const result = await sendTestSMS();
      return NextResponse.json({
        success: result.success,
        message: result.message,
      });
    }

    // Prediction SMS
    if (type === 'prediction' && data) {
      const success = await sendPredictionSMS(data);
      return NextResponse.json({
        success,
        message: success ? 'Prediction SMS sent!' : 'Failed to send SMS',
      });
    }

    // Custom SMS
    if (type === 'custom' && message) {
      const result = await sendCustomSMS(message, phone);
      return NextResponse.json({
        success: result.success,
        message: result.message,
      });
    }

    // Check balance
    if (type === 'balance') {
      const result = await checkSMSBalance();
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// GET - Check SMS status
export async function GET() {
  try {
    const result = await checkSMSBalance();
    return NextResponse.json({
      configured: !!process.env.NOTIFYLK_API_KEY,
      phone: process.env.SMS_PHONE ? '0750569545' : null,
      ...result,
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      message: 'Error checking SMS status',
    });
  }
}
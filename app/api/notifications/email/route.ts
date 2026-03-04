import { NextRequest, NextResponse } from 'next/server';
import { sendPredictionEmail, sendTestEmail } from '@/lib/email';

// POST - Send prediction email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'test') {
      const success = await sendTestEmail();
      return NextResponse.json({
        success,
        message: success ? 'Test email sent!' : 'Failed to send test email',
      });
    }

    if (type === 'prediction' && data) {
      const success = await sendPredictionEmail(data);
      return NextResponse.json({
        success,
        message: success ? 'Prediction email sent!' : 'Failed to send email',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
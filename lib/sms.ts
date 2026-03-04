// Notify.lk SMS Service for Sri Lanka
// Using Real AI Prediction Data

export interface SMSData {
  date: string;
  totalKw: number;
  totalSavings: number;
  peakHour: string;
  peakKw: number;
  avgTemp: number;
  hoursCount?: number;
}

// Format phone number for Sri Lanka
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('94')) {
    cleaned = '94' + cleaned;
  }
  
  return cleaned;
};

// Modern SMS Message Format
const generateModernSMS = (data: SMSData): string => {
  const co2Saved = (data.totalKw * 0.5).toFixed(1);
  const efficiency = '94.5';
  
  return `═══════════════════
  LAKDHANVI SOLAR
   AI Daily Report


📅 ${data.date}

┌─────────────────┐
│    ENERGY        │
│    ${data.totalKw} kWh      │
├─────────────────┤
│    SAVINGS       │
│    Rs.${data.totalSavings.toLocaleString()}    │
├─────────────────┤
│    PEAK HOUR     │
│    ${data.peakHour}         │
│    ${data.peakKw} kW        │
├─────────────────┤
│    AVG TEMP      │
│    ${data.avgTemp}°C        │
└─────────────────┘

 CO₂ Saved: ${co2Saved} kg
 Efficiency: ${efficiency}%

━━━━━━━━━━━━━━━━━━━
Powered by AI 
Lakdhanvi Limited`;
};

// Short Modern SMS (Character Efficient)
const generateShortModernSMS = (data: SMSData): string => {
  return ` LAKDHANVI SOLAR
━━━━━━━━━━━━━━━━━
 ${data.date}

 ${data.totalKw} kWh
 Rs.${data.totalSavings.toLocaleString()}
 Peak: ${data.peakHour} (${data.peakKw}kW)
 ${data.avgTemp}°C
 CO₂: ${(data.totalKw * 0.5).toFixed(1)}kg

━━━━━━━━━━━━━━━━━
 AI Powered Report`;
};

// Compact SMS (For SMS character limits)
const generateCompactSMS = (data: SMSData): string => {
  return `LAKDHANVI ${data.date}
${data.totalKw}kWh Rs.${data.totalSavings}
Peak:${data.peakHour}(${data.peakKw}kW)
${data.avgTemp}°C ${(data.totalKw * 0.5).toFixed(1)}kg CO2
-AI Report`;
};

// Send SMS via Notify.lk
export const sendSMSViaNotifyLk = async (
  message: string,
  phoneNumber?: string
): Promise<{ success: boolean; message: string; response?: any }> => {
  try {
    const apiKey = process.env.NOTIFYLK_API_KEY;
    const userId = process.env.NOTIFYLK_USER_ID;
    const senderId = process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO';
    const phone = formatPhoneNumber(phoneNumber || process.env.SMS_PHONE || '');

    if (!apiKey) {
      console.error('❌ Notify.lk API key not configured');
      return { success: false, message: 'API key not configured' };
    }

    if (!userId) {
      console.error('❌ Notify.lk User ID not configured');
      return { success: false, message: 'User ID not configured' };
    }

    if (!phone) {
      console.error('❌ Phone number not configured');
      return { success: false, message: 'Phone number not configured' };
    }

    console.log('📱 Sending SMS to:', phone);

    // Notify.lk API endpoint
    const url = 'https://app.notify.lk/api/v1/send';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        to: phone,
        message: message,
      }),
    });

    const responseData = await response.json();
    console.log('📱 Notify.lk Response:', responseData);

    if (response.ok && responseData.status === 'success') {
      console.log('✅ SMS sent successfully!');
      return { 
        success: true, 
        message: 'SMS sent successfully!',
        response: responseData 
      };
    } else {
      console.error('❌ SMS failed:', responseData);
      return { 
        success: false, 
        message: responseData.message || 'Failed to send SMS',
        response: responseData 
      };
    }
  } catch (error) {
    console.error('❌ SMS error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Send prediction SMS with modern format
export const sendPredictionSMS = async (
  data: SMSData, 
  format: 'modern' | 'short' | 'compact' = 'short'
): Promise<boolean> => {
  let message: string;
  
  switch (format) {
    case 'modern':
      message = generateModernSMS(data);
      break;
    case 'compact':
      message = generateCompactSMS(data);
      break;
    default:
      message = generateShortModernSMS(data);
  }
  
  const result = await sendSMSViaNotifyLk(message);
  return result.success;
};

// Send test SMS
export const sendTestSMS = async (): Promise<{ success: boolean; message: string }> => {
  const testMessage = `═══════════════════
   ✅ TEST SUCCESS
   LAKDHANVI SOLAR
═══════════════════

Your SMS notifications 
are now ACTIVE! 🎉

📱 Daily reports will
   arrive at 8:00 AM

━━━━━━━━━━━━━━━━━━━
🤖 Powered by AI
   Lakdhanvi Limited`;

  return await sendSMSViaNotifyLk(testMessage);
};

// Fetch real prediction and send SMS
export const fetchAndSendPredictionSMS = async (): Promise<{
  success: boolean;
  message: string;
  data?: SMSData;
}> => {
  try {
    // Get today's date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const displayDate = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    console.log('🔄 Fetching real prediction from AI model...');

    // Fetch from AI model
    const response = await fetch('https://solar-ai-model.onrender.com/predict_range', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateStr,
        start_hour: 6,
        end_hour: 18,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from AI model');
    }

    const prediction = await response.json();
    console.log('✅ Received prediction:', prediction.total_kw, 'kWh');

    // Find peak hour
    const peakHour = prediction.breakdown.reduce(
      (max: any, item: any) => (item.predicted_kw > max.predicted_kw ? item : max),
      prediction.breakdown[0]
    );

    // Calculate average temperature
    const avgTemp = Math.round(
      prediction.breakdown.reduce((sum: number, item: any) => sum + item.predicted_temp, 0) /
        prediction.breakdown.length
    );

    // Prepare SMS data
    const smsData: SMSData = {
      date: displayDate,
      totalKw: prediction.total_kw,
      totalSavings: prediction.total_savings,
      peakHour: peakHour.hour,
      peakKw: peakHour.predicted_kw,
      avgTemp: avgTemp,
      hoursCount: prediction.breakdown.length,
    };

    // Send SMS
    const smsSent = await sendPredictionSMS(smsData, 'short');

    return {
      success: smsSent,
      message: smsSent ? 'Real prediction SMS sent!' : 'Failed to send SMS',
      data: smsData,
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
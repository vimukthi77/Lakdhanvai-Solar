import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
export interface PredictionEmailData {
  date: string;
  totalKw: number;
  totalSavings: number;
  peakHour: string;
  peakKw: number;
  avgTemp: number;
  breakdown: Array<{
    hour: string;
    predicted_kw: number;
    predicted_temp: number;
    saving_lkr: number;
  }>;
}

// Generate HTML email template
const generateEmailTemplate = (data: PredictionEmailData): string => {
  const breakdownRows = data.breakdown
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; text-align: left;">${item.hour}</td>
          <td style="padding: 12px; text-align: center;">${item.predicted_temp}°C</td>
          <td style="padding: 12px; text-align: center; color: #f97316; font-weight: bold;">${item.predicted_kw} kW</td>
          <td style="padding: 12px; text-align: right; color: #22c55e;">Rs. ${item.saving_lkr}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lakdhanvi Solar - Daily Report</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #172554 0%, #1e3a5f 100%); padding: 40px 30px; text-align: center; border-radius: 0 0 30px 30px;">
          <div style="width: 70px; height: 70px; background-color: #f97316; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">⚡</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Lakdhanvi Solar</h1>
          <p style="color: #94a3b8; margin: 10px 0 0;">Daily AI Prediction Report</p>
        </div>

        <!-- Date Banner -->
        <div style="background-color: #f97316; padding: 15px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: bold;">
            📅 ${data.date}
          </p>
        </div>

        <!-- Summary Cards -->
        <div style="padding: 30px;">
          <h2 style="color: #172554; margin: 0 0 20px; font-size: 20px;">📊 Today's Summary</h2>
          
          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <!-- Total Energy -->
            <div style="flex: 1; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 20px; border-radius: 16px; text-align: center; border: 2px solid #fed7aa;">
              <p style="margin: 0; font-size: 14px; color: #9a3412;">Total Energy</p>
              <p style="margin: 10px 0 0; font-size: 28px; font-weight: bold; color: #f97316;">${data.totalKw}</p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #ea580c;">kWh</p>
            </div>
            
            <!-- Total Savings -->
            <div style="flex: 1; background: linear-gradient(135deg, #172554 0%, #1e3a5f 100%); padding: 20px; border-radius: 16px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">Est. Savings</p>
              <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #ffffff;">Rs. ${data.totalSavings.toLocaleString()}</p>
            </div>
          </div>

          <div style="display: flex; gap: 15px;">
            <!-- Peak Hour -->
            <div style="flex: 1; background-color: #f1f5f9; padding: 20px; border-radius: 16px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">🔥 Peak Hour</p>
              <p style="margin: 10px 0 0; font-size: 22px; font-weight: bold; color: #172554;">${data.peakHour}</p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #f97316;">${data.peakKw} kW</p>
            </div>
            
            <!-- Avg Temperature -->
            <div style="flex: 1; background-color: #f1f5f9; padding: 20px; border-radius: 16px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">🌡️ Avg Temp</p>
              <p style="margin: 10px 0 0; font-size: 22px; font-weight: bold; color: #172554;">${data.avgTemp}°C</p>
            </div>
          </div>
        </div>

        <!-- Hourly Breakdown -->
        <div style="padding: 0 30px 30px;">
          <h2 style="color: #172554; margin: 0 0 20px; font-size: 20px;">⏰ Hourly Breakdown</h2>
          
          <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #172554;">
                  <th style="padding: 15px; text-align: left; color: #ffffff; font-size: 12px;">TIME</th>
                  <th style="padding: 15px; text-align: center; color: #ffffff; font-size: 12px;">TEMP</th>
                  <th style="padding: 15px; text-align: center; color: #ffffff; font-size: 12px;">POWER</th>
                  <th style="padding: 15px; text-align: right; color: #ffffff; font-size: 12px;">SAVINGS</th>
                </tr>
              </thead>
              <tbody>
                ${breakdownRows}
              </tbody>
              <tfoot>
                <tr style="background-color: #172554;">
                  <td colspan="2" style="padding: 15px; color: #ffffff; font-weight: bold;">TOTAL</td>
                  <td style="padding: 15px; text-align: center; color: #f97316; font-weight: bold;">${data.totalKw} kWh</td>
                  <td style="padding: 15px; text-align: right; color: #22c55e; font-weight: bold;">Rs. ${data.totalSavings.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Environmental Impact -->
        <div style="padding: 0 30px 30px;">
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 16px; border: 2px solid #86efac;">
            <h3 style="color: #166534; margin: 0 0 15px; font-size: 18px;">🌱 Environmental Impact</h3>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1; text-align: center;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #16a34a;">${(data.totalKw * 0.5).toFixed(1)} kg</p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #15803d;">CO₂ Reduced</p>
              </div>
              <div style="flex: 1; text-align: center;">
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #16a34a;">${Math.floor(data.totalKw * 0.02)}</p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #15803d;">Trees Equivalent</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #172554; padding: 30px; text-align: center;">
          <p style="color: #f97316; margin: 0; font-weight: bold;">⚡ Lakdhanvi Limited</p>
          <p style="color: #94a3b8; margin: 10px 0 0; font-size: 12px;">Solar Energy Solutions • Powered by AI</p>
          <p style="color: #64748b; margin: 15px 0 0; font-size: 11px;">
            This is an automated daily report. Do not reply to this email.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};

// Generate plain text version
const generatePlainText = (data: PredictionEmailData): string => {
  return `
LAKDHANVI SOLAR - DAILY AI PREDICTION REPORT
=============================================

📅 Date: ${data.date}

📊 TODAY'S SUMMARY
------------------
Total Energy: ${data.totalKw} kWh
Est. Savings: Rs. ${data.totalSavings.toLocaleString()}
Peak Hour: ${data.peakHour} (${data.peakKw} kW)
Avg Temperature: ${data.avgTemp}°C

⏰ HOURLY BREAKDOWN
-------------------
${data.breakdown.map((item) => `${item.hour}: ${item.predicted_kw} kW | ${item.predicted_temp}°C | Rs. ${item.saving_lkr}`).join('\n')}

🌱 ENVIRONMENTAL IMPACT
-----------------------
CO₂ Reduced: ${(data.totalKw * 0.5).toFixed(1)} kg
Trees Equivalent: ${Math.floor(data.totalKw * 0.02)}

---
Lakdhanvi Limited
Solar Energy Solutions • Powered by AI
  `;
};

// Send email function
export const sendPredictionEmail = async (data: PredictionEmailData): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Lakdhanvi Solar" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `☀️ Solar Report - ${data.date} | ${data.totalKw} kWh Generated`,
      text: generatePlainText(data),
      html: generateEmailTemplate(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// Send test email
export const sendTestEmail = async (): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Lakdhanvi Solar" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: '✅ Lakdhanvi Solar - Email Notifications Active',
      text: 'Your email notifications are now active! You will receive daily prediction reports at 2:00 PM.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #172554; border-radius: 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
          <h1 style="color: #ffffff; margin: 0;">Notifications Active!</h1>
          <p style="color: #94a3b8; margin: 20px 0;">Your email notifications are now enabled.</p>
          <p style="color: #f97316; font-weight: bold;">Daily reports will be sent at 2:00 PM</p>
          <hr style="border: none; border-top: 1px solid #1e3a5f; margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px;">Lakdhanvi Limited • Solar Energy Solutions</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Test email error:', error);
    return false;
  }
};
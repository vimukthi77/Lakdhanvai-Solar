import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, dashboardData } = await req.json();

    const API_KEY = "AIzaSyCrhyrmZWATXgYABAn9_snquwnW6SAdr4E";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    
    const systemPerformance = dashboardData ? `
      System Profile for Prediction:
      - Current Efficiency: ${dashboardData.efficiency}%
      - Average daily energy: ${dashboardData.totalEnergy}kWh
      - Average daily savings: Rs. ${dashboardData.totalSavings}
      - Today's Date: ${new Date().toLocaleDateString()}
    ` : "System data not available for prediction.";

    const payload = {
      contents: [{
        parts: [{
          text: `You are SolarPro AI, a smart solar forecaster. 
          
          Knowledge:
          ${systemPerformance}
          
          Instructions:
          1. If the user asks for a prediction (e.g., "How much will I earn tomorrow?" or "Predict next Monday"), calculate an estimate based on the "System Profile" above.
          2. Use phrases like "Based on your current system efficiency..." or "Estimated projection:".
          3. Mention that solar production depends on weather conditions.
          4. If the user asks about a specific future date, look at the current efficiency and provide a professional estimate.
          5. Reply in English professionally with emojis.

          User Question: ${message}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am analyzing your system trends... 🔋";

    return NextResponse.json({ reply: aiText });

  } catch (error) {
    return NextResponse.json({ reply: "I couldn't calculate the prediction right now. 🛠️" }, { status: 500 });
  }
}
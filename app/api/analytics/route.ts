import { NextResponse } from 'next/server';

// --- පියවර 1: දත්ත වල හැඩය පැහැදිලි කිරීමට Interface එකක් සෑදීම ---
interface SolarItem {
  time: string;
  actual: number;
  predicted: number;
  clouds: number;
}

export async function GET() {
  const lat = 6.9271; // Colombo
  const lon = 79.8612;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=shortwave_radiation,cloud_cover&timezone=Asia%2FColombo&forecast_days=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const solarStats: SolarItem[] = data.hourly.time
      .map((t: string, index: number): SolarItem => {
        const hour = new Date(t).getHours();
        const radiation = data.hourly.shortwave_radiation[index];
        const clouds = data.hourly.cloud_cover[index];

        const actualGen = (radiation * 0.15) * (1 - clouds / 200); 
        const predictedGen = (radiation * 0.15);

        return {
          time: `${hour}:00`,
          actual: parseFloat(actualGen.toFixed(2)),
          predicted: parseFloat(predictedGen.toFixed(2)),
          clouds: clouds
        };
      })
      // --- පියවර 2: 'any' වෙනුවට 'SolarItem' පාවිච්චි කර පෙරීම ---
      .filter((item: SolarItem) => {
        const h = parseInt(item.time.split(':')[0]);
        return h >= 6 && h <= 18;
      });

    return NextResponse.json(solarStats);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch real data" }, { status: 500 });
  }
}
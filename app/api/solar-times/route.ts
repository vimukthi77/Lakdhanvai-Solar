import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ශ්‍රී ලංකාවේ (කොළඹ) Latitude සහ Longitude
    const lat = 6.9271;
    const lng = 79.8612;

    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
    );
    const data = await response.json();

    if (data.status !== "OK") {
        throw new Error("Failed to fetch solar data");
    }

    // වේලාවන් ලංකාවේ වේලාවට (GMT+5:30) හරවා සකස් කිරීම
    const formatTime = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    return NextResponse.json({
      sunrise: formatTime(data.results.sunrise),
      sunset: formatTime(data.results.sunset),
      day_length: data.results.day_length,
    });

  } catch (error) {
    return NextResponse.json({ error: "Could not fetch times" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get('lat') || '37.5665';
  const lon = url.searchParams.get('lon') || '126.9780';
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) {
    return NextResponse.json({ error: 'Missing OPENWEATHER_API_KEY' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    );
    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: 'Weather API failed', detail: text }, { status: 500 });
    }

    const data = JSON.parse(text);

    return NextResponse.json({
      temp: data.main.temp,
      description: data.weather[0].description,
      hourly: [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected server error', detail: e.message }, { status: 500 });
  }
}

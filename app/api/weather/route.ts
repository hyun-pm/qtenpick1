import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "37.5665";
  const lon = url.searchParams.get("lon") || "126.9780";
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${key}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      temp: data.current.temp,
      description: data.current.weather[0].description,
      hourly: data.hourly.slice(0, 12).map((h: any) => h.temp),
    });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "37.5665";
  const lon = url.searchParams.get("lon") || "126.9780";
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    );

    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json({ error: "Weather API failed", detail: msg }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      temp: data.main.temp,
      description: data.weather[0].description,
      hourly: [], // One Call 아닌 현재 날씨 API에는 없음
    });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected weather API error" }, { status: 500 });
  }
}

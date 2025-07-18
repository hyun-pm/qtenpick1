import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "37.5665";
  const lon = url.searchParams.get("lon") || "126.9780";
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${key}`
  );

  const data = await res.json();
  return NextResponse.json({
    temp: data.current.temp,
    description: data.current.weather[0].description,
    hourly: data.hourly.slice(0, 12).map((h: any) => h.temp),
  });
}

"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const lat = 37.5665;
    const lon = 126.9780;

    const res1 = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const weatherData = await res1.json();
    setWeather(weatherData);

    const res2 = await fetch("/api/recommend", {
      method: "POST",
      body: JSON.stringify({
        temp: weatherData.temp,
        style: "default",
        weatherMain: weatherData.main
      }),
    });
    const recData = await res2.json();
    setRec(recData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getWeatherIcon = (main: string) => {
    const iconMap: Record<string, string> = {
      Clear: "/icons/Clear.png",
      Clouds: "/icons/Clouds.png",
      Rain: "/icons/Rain.png",
      Snow: "/icons/Snow.png",
      Drizzle: "/icons/Drizzle.png",
      Thunderstorm: "/icons/Thunderstorm.png",
      Mist: "/icons/Fog.png",
      Fog: "/icons/Fog.png",
    };
    return iconMap[main] || "/icons/Clear.png";
  };

  return (
    <main className="bg-pink-50 min-h-screen text-center font-sans">
      <h1 className="text-3xl font-bold text-pink-600 py-6">오늘의 스타일:</h1>

      {weather && (
        <div className="flex justify-center items-center gap-2 text-lg mb-4">
          <img src={getWeatherIcon(weather.main)} alt="weather" width={32} height={32} />
          <span>현재 날씨: {weather.description} · {weather.temp}°C</span>
        </div>
      )}

      {rec && (
        <>
          <h2 className="text-xl text-pink-600 my-3">👕 착장</h2>
          <ul className="text-sm leading-6">
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>

          <h2 className="text-xl text-pink-600 mt-6 mb-3">💄 메이크업</h2>
          <ul className="text-sm leading-6">
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10">
        <button onClick={fetchData}>
          <img src="/icons/button.png" alt="refresh" width={120} height={48} />
        </button>
      </div>
    </main>
  );
}

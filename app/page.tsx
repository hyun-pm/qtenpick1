'use client';

import { useEffect, useState } from 'react';

type Outfit = Record<string, string>;
type Makeup = Record<string, string>;

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<{
    style: string;
    outfit: Outfit;
    makeup: Makeup;
    pixelPrompt: string;
  } | null>(null);
  const [img, setImg] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const w = await fetch('/api/weather').then(r => r.json());
    setWeather(w);

    const r = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ weather: w }),
    }).then(r => r.json());
    setRec(r);

    const i = await fetch('/api/pixel', {
      method: 'POST',
      body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
    }).then(r => r.json());

    setImg(i.image);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const getWeatherIcon = (weatherMain: string) => {
    const map: Record<string, string> = {
      Clear: "/icons/clear.png",
      Clouds: "/icons/clouds.png",
      Rain: "/icons/rain.png",
      Snow: "/icons/snow.png",
      Drizzle: "/icons/drizzle.png",
      Thunderstorm: "/icons/thunderstorm.png",
      Fog: "/icons/fog.png",
    };
    return map[weatherMain] || "/icons/unknown.png";
  };

  const weatherIconPath = getWeatherIcon(weather?.main || '');

  return (
    <main className="min-h-screen bg-pink-50 p-6 text-gray-800 font-pixel">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-pink-600 mb-2">
          오늘의 스타일: <span className="text-black">"{rec?.style}"</span>
        </h1>

        {weather && (
          <div className="text-sm flex justify-center items-center gap-2 mb-4">
            <img src={weatherIconPath} alt="날씨" className="w-6 h-6" />
            <span>{weather.description}, {weather.temp}°C</span>
          </div>
        )}

        {img && (
          <div className="flex justify-center mb-4">
            <img src={img} alt="픽셀 아바타" className="w-[160px] h-auto" />
          </div>
        )}

        {rec && (
          <>
            <div className="mb-4">
              <h2 className="text-xl text-pink-600 mb-1">👕 착장</h2>
              <ul className="ml-4 text-sm leading-6">
                {Object.entries(rec.outfit).map(([k, v]) => (
                  <li key={k}><b>{k}</b>: {v}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h2 className="text-xl text-pink-600 mb-1">💄 메이크업</h2>
              <ul className="ml-4 text-sm leading-6">
                {Object.entries(rec.makeup).map(([k, v]) => (
                  <li key={k}><b>{k}</b>: {v}</li>
                ))}
              </ul>
            </div>

            {/* 관련 상품 Placeholder */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">🛍 관련 상품</h3>
              <div className="flex gap-4 justify-center">
                <div className="w-24 h-24 bg-gray-200 rounded text-center text-xs pt-8">상품명</div>
                <div className="w-24 h-24 bg-gray-200 rounded text-center text-xs pt-8">상품명</div>
                <div className="w-24 h-24 bg-gray-200 rounded text-center text-xs pt-8">상품명</div>
              </div>
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <button onClick={refresh}>
            <img src="/button-pixel.png" alt="다시 추천받기" className="w-40 hover:opacity-80" />
          </button>
        </div>
      </div>
    </main>
  );
}

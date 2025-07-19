'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [pixel, setPixel] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const weatherRes = await fetch('/api/weather');
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({
          temp: weatherData.temp,
          weatherMain: weatherData.main,
          description: weatherData.description,
          style: '러블리', // or 랜덤 스타일
        }),
      });

      const recommendData = await recommendRes.json();
      setRec(recommendData);

      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        body: JSON.stringify({ prompt: recommendData.pixelPrompt }),
      });

      const pixelData = await pixelRes.json();
      setPixel(pixelData.image);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refresh = () => {
    fetchAll();
  };

  const getWeatherIcon = (main: string) => {
    const safeMain = main || 'Clear';
    return `/icons/${safeMain}.png`;
  };

  return (
    <main className="min-h-screen bg-pink-100 flex flex-col items-center justify-start px-4 py-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">🎀 오늘의 스타일 추천</h1>

      {weather && (
        <div className="flex items-center space-x-2 mb-6">
          <Image
            src={getWeatherIcon(weather.main)}
            alt="날씨"
            width={40}
            height={40}
          />
          <span className="text-sm">{weather.description} / {weather.temp}°C</span>
        </div>
      )}

      {loading && (
        <p className="text-center mt-6 text-sm text-gray-500">로딩 중...</p>
      )}

      {!loading && pixel && (
        <Image
          src={pixel}
          alt="캐릭터"
          width={200}
          height={200}
          className="mb-4"
        />
      )}

      {rec && (
        <>
          <h2 className="text-lg font-semibold">👗 착장</h2>
          <ul className="text-left text-sm mb-6">
            {(Object.entries(rec.outfit) as [string, string][])
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b>: {value}
                </li>
              ))}
          </ul>

          <h2 className="text-lg font-semibold">💄 메이크업</h2>
          <ul className="text-left text-sm mb-6">
            {(Object.entries(rec.makeup) as [string, string][])
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b>: {value}
                </li>
              ))}
          </ul>
        </>
      )}

      <button onClick={refresh} className="mt-4">
        <Image src="/icons/button.png" alt="다시 추천받기" width={120} height={40} />
      </button>
    </main>
  );
}

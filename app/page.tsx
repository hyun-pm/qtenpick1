'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [pixelUrl, setPixelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    const lat = 37.5665;
    const lon = 126.9780;
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await res.json();
    setWeather(data);
  };

  const fetchRecommendation = async () => {
    if (!weather) return;
    setLoading(true);
    setRec(null);
    setPixelUrl(null);

    const styleOptions = ["캐주얼", "러블리", "미니멀", "시크", "빈티지"];
    const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];

    const res = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        temp: weather.temp,
        weatherMain: weather.weatherMain,
        description: weather.description,
        style: randomStyle
      }),
    });

    const data = await res.json();

    if (!data.pixelPrompt) {
      setLoading(false);
      return;
    }

    setRec(data);

    const pixelRes = await fetch('/api/pixel', {
      method: 'POST',
      body: JSON.stringify({ pixelPrompt: data.pixelPrompt }),
    });

    const pixelData = await pixelRes.json();
    setPixelUrl(pixelData.image);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (weather) fetchRecommendation();
  }, [weather]);

  const weatherIcon = weather?.weatherMain
    ? `/icons/${weather.weatherMain}.png`
    : '/icons/Clear.png';

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 bg-pink-100 text-center font-sans">
      <h1 className="text-3xl font-bold text-pink-700 mt-6 mb-2">✨ 오늘의 스타일 ✨</h1>

      {weather && (
        <div className="flex items-center justify-center gap-2 text-gray-700 text-lg mb-4">
          <Image src={weatherIcon} alt="날씨 아이콘" width={32} height={32} />
          <span>{weather.description} / {weather.temp.toFixed(2)}℃</span>
        </div>
      )}

      {loading && <p className="text-gray-500">로딩 중...</p>}

      {!loading && rec && (
        <>
          <h2 className="text-xl font-semibold text-pink-700 mb-2">👗 착장</h2>
          {pixelUrl && (
            <div className="mb-4">
              <Image
                src={pixelUrl}
                alt="추천 픽셀 캐릭터"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
          )}

          <ul className="text-left text-sm mb-6">
            {Object.entries(rec.outfit).map(([key, value]) => (
              value && <li key={key}><b>{key}</b>: {value}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold text-pink-700 mb-2">💄 메이크업</h2>
          <ul className="text-left text-sm mb-6">
            {Object.entries(rec.makeup).map(([key, value]) => (
              value && <li key={key}><b>{key}</b>: {value}</li>
            ))}
          </ul>
        </>
      )}

      <button
        onClick={fetchRecommendation}
        className="mt-6"
      >
        <Image
          src="/icons/button.png"
          alt="다시 추천받기"
          width={150}
          height={50}
        />
      </button>
    </main>
  );
}

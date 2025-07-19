'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [pixelUrl, setPixelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = pos.coords;

      const weatherRes = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: weatherData }),
      });

      const recommendData = await recommendRes.json();
      setRec(recommendData);

      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelPrompt: recommendData.pixelPrompt }),
      });

      const pixelData = await pixelRes.json();
      setPixelUrl(pixelData.image);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const weatherTextMap: Record<string, string> = {
    Clear: '맑음',
    Clouds: '흐림',
    Rain: '비',
    Snow: '눈',
    Thunderstorm: '천둥번개',
    Drizzle: '이슬비',
    Fog: '안개',
    Mist: '안개',
  };

  const weatherText = rec?.weather ? weatherTextMap[rec.weather] || rec.weather : '';
  const weatherIconSrc = rec?.weather ? `/icons/${rec.weather}.png` : '';

  return (
    <main className="min-h-screen bg-pink-100 font-sans py-10 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-pink-700 mb-2">오늘의 스타일: "{rec?.style || ''}"</h1>

      {weather && rec && (
        <div className="flex items-center gap-2 text-gray-700 text-sm mb-2">
          {weatherIconSrc && (
            <img src={weatherIconSrc} alt={rec.weather} className="w-6 h-6 inline-block" />
          )}
          <span>{weatherText} · {weather.temp}℃</span>
        </div>
      )}

      {loading && <p className="text-gray-600 mt-4">스타일 추천 중...</p>}

      {pixelUrl && (
        <img src={pixelUrl} alt="픽셀 캐릭터" className="w-40 h-auto rounded-lg mb-4" />
      )}

      {rec && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-pink-700 mb-2">👕 착장</h2>
            <ul className="ml-4 text-sm leading-6 text-gray-800">
              {Object.entries(rec.outfit).map(([k, v]) => (
                <li key={k}><b>{k}</b>: {v}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-pink-700 mb-2">💄 메이크업</h2>
            <ul className="ml-4 text-sm leading-6 text-gray-800">
              {Object.entries(rec.makeup).map(([k, v]) => (
                <li key={k}><b>{k}</b>: {v}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-pink-700 mb-2">🛍 관련 상품</h2>
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white w-24 h-28 rounded-lg shadow-md flex flex-col justify-center items-center text-xs text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 mb-1 rounded" />
                  <span>상품명</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={fetchData}
        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded mt-6"
      >
        다시 추천받기
      </button>
    </main>
  );
}

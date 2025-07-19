'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [pixel, setPixel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    setPixel(null);
    try {
      // 서울 좌표
      const lat = 37.5665;
      const lon = 126.978;

      // 1. 날씨 API 호출
      const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // 2. 추천 API 호출
      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: weatherData.temp,
          weatherMain: weatherData.main,
          description: weatherData.description,
          style: getRandomStyle()
        })
      });
      const recData = await recommendRes.json();
      setRec(recData);

      // 3. 픽셀 이미지 생성
      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelPrompt: recData.pixelPrompt })
      });
      const pixelData = await pixelRes.json();
      setPixel(pixelData.image);
    } catch (e) {
      console.error('에러:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRandomStyle = () => {
    const styles = ['러블리', '미니멀', '캐주얼', '걸리쉬', '엣지', '스포티'];
    return styles[Math.floor(Math.random() * styles.length)];
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen bg-pink-100 py-10 font-['Galmuri11'] text-sm">
      <h1 className="text-3xl font-bold text-pink-600 mb-2">오늘의 스타일</h1>
      {rec && <div className="text-lg mb-4">"{rec.style}"</div>}

      {/* 날씨 정보 */}
      {weather && (
        <div className="flex items-center gap-2 mb-4 text-gray-800 text-sm">
          <img
            src={`/icons/${weather.main}.png`}
            alt={weather.main}
            className="w-6 h-6"
          />
          <span>{weather.description} / {weather.temp}°C</span>
        </div>
      )}

      {/* 캐릭터 이미지 */}
      {pixel && (
        <img
          src={pixel}
          alt="픽셀 아바타"
          className="w-40 h-40 object-contain mb-4"
        />
      )}

      {/* 착장 정보 */}
      {rec?.outfit && (
        <div className="mb-6">
          <h2 className="text-lg text-pink-600 font-semibold mb-1">👕 착장</h2>
          <ul className="text-left ml-4 leading-6">
            {Object.entries(rec.outfit as Record<string, string>).map(([key, value]) => (
              <li key={key}>
                <b>{key}:</b> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 메이크업 정보 */}
      {rec?.makeup && (
        <div className="mb-6">
          <h2 className="text-lg text-pink-600 font-semibold mb-1">💄 메이크업</h2>
          <ul className="text-left ml-4 leading-6">
            {Object.entries(rec.makeup as Record<string, string>).map(([key, value]) => (
              <li key={key}>
                <b>{key}:</b> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 추천 버튼 */}
      <button onClick={getData} disabled={loading} className="mt-4">
        <img
          src="/icons/button.png"
          alt="다시 추천받기"
          className="w-32 h-auto hover:opacity-80 transition"
        />
      </button>
    </main>
  );
}

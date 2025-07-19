'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [pixel, setPixel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. 날씨 정보 가져오기
      const weatherRes = await fetch('/api/weather');
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // 2. GPT 추천 요청 (style은 GPT가 생성)
      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: weatherData.temp,
          weatherMain: weatherData.main,
          description: weatherData.description,
        }),
      });

      const recommendData = await recommendRes.json();
      if (!recommendData.pixelPrompt) {
        throw new Error('pixelPrompt 누락 - GPT 응답 오류');
      }
      setRec(recommendData);

      // 3. 픽셀 캐릭터 이미지 생성 (Base64 응답)
      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelPrompt: recommendData.pixelPrompt }),
      });

      const pixelData = await pixelRes.json();
      if (!pixelData.image) {
        throw new Error('픽셀 이미지 생성 실패');
      }
      setPixel(pixelData.image); // ← Base64 문자열
    } catch (err: any) {
      console.error(err);
      setError(err.message || '에러 발생');
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
    const iconName = safeMain.charAt(0).toUpperCase() + safeMain.slice(1).toLowerCase();
    return `/icons/${iconName}.png`;
  };

  return (
    <main className="min-h-screen bg-pink-100 flex flex-col items-center justify-start px-4 py-8 font-[Galmuri]">
      <h1 className="text-2xl font-bold mb-4 text-pink-700">🎀 오늘의 스타일 추천</h1>

      {/* 날씨 */}
      {weather && (
        <div className="flex items-center gap-2 mb-4">
          <Image
            src={getWeatherIcon(weather.main)}
            alt="날씨 아이콘"
            width={40}
            height={40}
          />
          <span className="text-sm text-gray-800">
            {weather.description} / {weather.temp}°C
          </span>
        </div>
      )}

      {/* 스타일 */}
      {rec?.style && (
        <h2 className="text-lg font-bold text-pink-600 mb-2">스타일: "{rec.style}"</h2>
      )}

      {/* 로딩 & 에러 */}
      {loading && <p className="text-center mt-6 text-sm text-gray-500">로딩 중...</p>}
      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

      {/* 픽셀 캐릭터: Base64는 <img>로 */}
      {!loading && pixel && (
        <img
          src={pixel}
          alt="추천 캐릭터"
          width={240}
          height={240}
          className="mb-4 rounded"
        />
      )}

      {/* 추천 결과 출력 */}
      {rec && (
        <div className="w-full max-w-xs text-sm mb-6">
          <h3 className="font-semibold text-pink-600 mb-1">👗 착장</h3>
          <ul className="list-disc ml-4">
            {(Object.entries(rec.outfit) as [string, string][])
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b>: {value}
                </li>
              ))}
          </ul>

          <h3 className="font-semibold text-pink-600 mt-4 mb-1">💄 메이크업</h3>
          <ul className="list-disc ml-4">
            {(Object.entries(rec.makeup) as [string, string][])
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b>: {value}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* 다시 추천받기 버튼 */}
      <button onClick={refresh} className="mt-4">
        <Image
          src="/icons/button.png"
          alt="다시 추천받기"
          width={120}
          height={40}
        />
      </button>
    </main>
  );
}

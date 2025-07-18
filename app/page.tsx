'use client';

import { useEffect, useState } from 'react';
import RefreshLoader from '../components/RefreshLoader';

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
  const [img, setImg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const w = await fetch('/api/weather').then((r) => r.json());
      setWeather(w);

      const r = await fetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({ weather: w }),
      }).then((r) => r.json());
      setRec(r);

      const i = await fetch('/api/pixel', {
        method: 'POST',
        body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
      }).then((r) => r.json());
      setImg(i.image);
    } catch (err) {
      console.error('오류 발생:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="min-h-screen bg-pink-50 px-6 py-10 font-['DungGeunMo'] text-gray-800">
      {loading && <RefreshLoader />}
      {!loading && rec && (
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6 text-pink-600">
            오늘의 스타일: <span className="text-black">"{rec.style}"</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-center w-full">
            <div className="w-60">
              <img src={img} alt="픽셀 아바타" className="w-full h-auto rounded border border-pink-300" />
            </div>

            <div className="text-center md:text-left">
              <div className="text-lg mb-2">
                🌤️ 현재 날씨: <b>{weather?.description}</b>, {weather?.temp}°C
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-pink-500">👕 착장</h2>
                <ul className="mt-1 text-sm leading-6">
                  {Object.entries(rec.outfit as Outfit).map(([k, v]) => (
                    <li key={k}><b>{k}</b>: {v}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-pink-500">💄 메이크업</h2>
                <ul className="mt-1 text-sm leading-6">
                  {Object.entries(rec.makeup as Makeup).map(([k, v]) => (
                    <li key={k}><b>{k}</b>: {v}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 추천 아이템 영역 */}
          <div className="mt-8 w-full">
            <h2 className="text-lg font-semibold mb-2">🛍 관련 상품</h2>
            <div className="flex gap-4 justify-center flex-wrap">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="w-24">
                  <div className="w-full h-24 bg-gray-200 rounded border border-pink-300" />
                  <p className="text-xs mt-1 text-center">상품명</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={refresh}
            className="mt-10 px-6 py-2 bg-pink-500 text-white font-semibold rounded-full border-2 border-pink-600 shadow hover:bg-pink-600 transition"
          >
            다시 추천받기
          </button>
        </div>
      )}
    </main>
  );
}

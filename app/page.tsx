'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
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

    const im = await fetch('/api/pixel', {
      method: 'POST',
      body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
    }).then(r => r.json());

    setImg(im.image);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center h-screen bg-pink-100 font-pixel text-lg">
        <p>🧸 캐릭터가 옷을 고르는 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-white p-6 text-gray-800 font-pixel">
      <h1 className="text-3xl font-bold text-center text-pink-500 mb-2">오늘의 스타일: <span className="text-black">"{rec.style}"</span></h1>
      
      {/* 날씨 정보 */}
      <div className="text-center mb-4 flex justify-center items-center gap-2">
        <img src="/sunny-pixel.png" alt="sun" className="w-6 h-6" />
        <span className="text-sm">{weather.description} · {weather.temp}°C</span>
      </div>

      {/* 캐릭터 이미지 */}
      <div className="flex justify-center mb-4">
        <img src={img} alt="픽셀 아바타" className="w-[160px] h-auto" />
      </div>

      {/* 착장 */}
      <div className="mb-4">
        <h2 className="text-xl text-pink-600 mb-1">👕 착장</h2>
        <ul className="ml-4 text-sm leading-6">
          {Object.entries(rec.outfit).map(([k, v]) => (
            <li key={k}><b>{k}</b>: {v}</li>
          ))}
        </ul>
      </div>

      {/* 메이크업 */}
      <div className="mb-4">
        <h2 className="text-xl text-pink-600 mb-1">💄 메이크업</h2>
        <ul className="ml-4 text-sm leading-6">
          {Object.entries(rec.makeup).map(([k, v]) => (
            <li key={k}><b>{k}</b>: {v}</li>
          ))}
        </ul>
      </div>

      {/* 관련 상품 placeholder */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">🛍 관련 상품</h3>
        <div className="flex gap-4 justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded text-center text-xs pt-8">상품명</div>
          <div className="w-24 h-24 bg-gray-200 rounded text-center text-xs pt-8">상품명</div>
          <div className="w-24 h-24 bg-gray-200 rounded text-center text-xs pt-8">상품명</div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="text-center">
        <button onClick={refresh}>
          <img src="/button-pixel.png" alt="다시 추천받기" className="w-40 hover:opacity-80" />
        </button>
      </div>
    </main>
  );
}

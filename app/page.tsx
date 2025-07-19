'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data));

    fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(data => {
        setRec(data);
        return fetch('/api/pixel', {
          method: 'POST',
          body: JSON.stringify({ pixelPrompt: data.pixelPrompt }),
        });
      })
      .then(res => res?.json())
      .then(data => setImage(data?.image || null));
  }, []);

  if (!weather || !rec || !image) {
    return <p className="text-center mt-32 text-gray-500">로딩 중...</p>;
  }

  // 🌤️ 날씨 상태로부터 아이콘 파일 경로 지정
  const weatherIconSrc = `/icons/${rec.weather}.png`;

  return (
    <main className="min-h-screen bg-pink-50 font-['Galmuri11'] p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-center text-2xl mb-2 font-bold text-pink-600">오늘의 스타일: <span className="text-black">"{rec.style}"</span></h1>

        <div className="flex justify-center items-center gap-4 mb-4">
          {/* 날씨 아이콘 및 온도 표시 */}
          <img src={weatherIconSrc} alt={rec.weather} className="w-10 h-10" />
          <p className="text-sm text-gray-700">{rec.weather} · {weather.temp}℃</p>
        </div>

        {/* 픽셀 캐릭터 */}
        <div className="flex justify-center mb-4">
          <img src={image} alt="Pixel Avatar" className="w-40 h-auto rounded-md border border-pink-200" />
        </div>

        {/* 착장 정보 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-pink-500 mb-1">👕 착장</h2>
          <ul className="ml-4 text-sm leading-6">
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>
        </div>

        {/* 메이크업 정보 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-pink-500 mb-1">💄 메이크업</h2>
          <ul className="ml-4 text-sm leading-6">
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>
        </div>

        {/* 추천 아이템 (향후 구현 예정) */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-pink-500 mb-2">🛍️ 관련 상품</h2>
          <div className="flex gap-2 justify-between">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-400">
                상품명
              </div>
            ))}
          </div>
        </div>

        {/* 다시 추천받기 버튼 */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold shadow transition"
          >
            다시 추천받기
          </button>
        </div>
      </div>
    </main>
  );
}

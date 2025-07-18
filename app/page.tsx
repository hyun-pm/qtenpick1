'use client';

import { useEffect, useState } from 'react';
import RefreshLoader from '../components/RefreshLoader';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const w = await fetch('/api/weather').then(r => r.json());
    setWeather(w);

    const r = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ weather: w })
    }).then(r => r.json());
    setRec(r);

    const i = await fetch('/api/pixel', {
      method: 'POST',
      body: JSON.stringify({ pixelPrompt: r.pixelPrompt })
    }).then(r => r.json());
    setImg(i.image);

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="p-6 font-sans text-center">
      {loading && <RefreshLoader />}
      {!loading && rec && (
        <div>
          <h1 className="text-2xl font-bold mb-4">오늘의 스타일: {rec.style}</h1>
          
          <div className="flex justify-center mb-6">
            <img src={img} alt="픽셀 아바타" className="w-60 h-auto mx-auto rounded" />
          </div>

          <div className="text-sm text-gray-600 mb-4">
            현재 날씨: {weather.description}, {weather.temp}°C
          </div>

          <h2 className="text-xl font-semibold mt-4">👕 착장</h2>
          <ul className="mt-2 mb-4 text-left inline-block">
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-4">💄 메이크업</h2>
          <ul className="mt-2 mb-4 text-left inline-block">
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>

          <button
            onClick={refresh}
            className="mt-4 px-6 py-2 bg-pink-500 text-white font-semibold rounded hover:bg-pink-600 transition"
          >
            다시 추천받기
          </button>
        </div>
      )}
    </main>
  );
}

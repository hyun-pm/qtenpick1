'use client';

import { useEffect, useState } from 'react';
import { RefreshLoader } from '../components/RefreshLoader';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState('');
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
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="p-4 font-mono">
      {loading && <RefreshLoader />}
      {!loading && rec && (
        <>
          <h1 className="text-2xl mb-4">오늘의 스타일: {rec.style}</h1>
          {img ? (
            <img src={img} alt="픽셀 아바타" />
          ) : (
            <p>⚠️ No image generated</p>
          )}
          <h2 className="mt-2 text-xl">👕 착장</h2>
          <ul>
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
          <h2 className="mt-2 text-xl">💄 메이크업</h2>
          <ul>
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
          <button
            onClick={refresh}
            className="mt-4 p-2 bg-pink-400 text-white rounded"
          >
            다시 추천받기
          </button>
        </>
      )}
    </main>
  );
}

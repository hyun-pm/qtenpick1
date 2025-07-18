'use client';

import { useEffect, useState } from 'react';
import RefreshLoader from '../components/RefreshLoader';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const w = await fetch('/api/weather').then((res) => res.json());
      setWeather(w);

      const r = await fetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({ weather: w }),
      }).then((res) => res.json());
      setRec(r);

      const im = await fetch('/api/pixel', {
        method: 'POST',
        body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
      }).then((res) => res.json());
      setImg(im.image);
    } catch (e) {
      console.warn('⚠ Error during refresh:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="p-4 font-mono">
      {loading && <RefreshLoader />}
      {!loading && rec && (
        <>
          <h1 className="text-xl">오늘의 스타일: {rec.style}</h1>
          <img src={img} alt="픽셀 아바타" className="my-2" />
          <h2 className="mt-2">👕 착장</h2>
          <ul>
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
          <h2 className="mt-2">💄 메이크업</h2>
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

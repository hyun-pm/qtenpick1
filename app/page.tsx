// app/page.tsx
'use client';

import { useEffect, useState } from "react";
import RefreshLoader from "../components/RefreshLoader";

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const w = await fetch("/api/weather").then((r) => r.json());
      setWeather(w);

      const r = await fetch("/api/recommend", {
        method: "POST",
        body: JSON.stringify({ weather: w }),
      }).then((r) => r.json());
      setRec(r);

      const im = await fetch("/api/pixel", {
        method: "POST",
        body: JSON.stringify({ pixelPrompt: r?.pixelPrompt }),
      }).then((r) => r.json());

      setImg(im.image);
    } catch (err) {
      console.error("오류 발생:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 font-mono">
      {loading && <RefreshLoader />}
      {!loading && rec && (
        <>
          <h1 className="text-xl">오늘의 스타일: {rec.style}</h1>
          {img ? (
            <img src={img} alt="픽셀 아바타" className="w-60 mt-2" />
          ) : (
            <p>⚠️ No image generated</p>
          )}

          <h2 className="mt-4 text-lg">👕 착장</h2>
          <ul className="ml-4 list-disc">
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v}
              </li>
            ))}
          </ul>

          <h2 className="mt-4 text-lg">💄 메이크업</h2>
          <ul className="ml-4 list-disc">
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v}
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

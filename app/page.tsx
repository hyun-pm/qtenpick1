'use client';

import { useEffect, useState } from "react";
import RefreshLoader from "../components/RefreshLoader";

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
    <main className="p-4 font-mono max-w-xl mx-auto">
      {loading && <RefreshLoader />}
      {!loading && rec && (
        <>
          <h1 className="text-2xl mb-2">오늘의 스타일: {rec.style}</h1>

          {img ? (
            <img src={img} alt="픽셀 아바타" className="my-4 w-60 mx-auto" />
          ) : (
            <p className="text-center text-red-400">⚠️ 이미지가 생성되지 않았습니다</p>
          )}

          <h2 className="mt-4 text-lg font-semibold">👕 착장</h2>
          <ul className="ml-4 list-disc">
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v}
              </li>
            ))}
          </ul>

          <h2 className="mt-4 text-lg font-semibold">💄 메이크업</h2>
          <ul className="ml-4 list-disc">
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v}
              </li>
            ))}
          </ul>

          <button
            onClick={refresh}
            className="mt-6 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
          >
            다시 추천받기
          </button>
        </>
      )}
    </main>
  );
}

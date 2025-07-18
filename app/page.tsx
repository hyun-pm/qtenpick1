'use client';
import { useEffect, useState } from "react";
import { RefreshLoader } from "../components/RefreshLoader";
import React from "react";

export default function Page() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);

      const w = await fetch("/api/weather").then((r) => r.json());
      if (w.error) throw new Error(w.error);
      setWeather(w);

      const r = await fetch("/api/recommend", {
        method: "POST",
        body: JSON.stringify({ weather: w }),
      }).then((r) => r.json());
      if (r.error) throw new Error(r.error);
      setRec(r);

      const im = await fetch("/api/pixel", {
        method: "POST",
        body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
      }).then((r) => r.json());
      if (im.error) throw new Error(im.error);
      setImg(im.imageUrl);
    } catch (e: any) {
      setError(e.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  const outfitItems: React.ReactNode[] = rec?.outfit
    ? (Object.entries(rec.outfit) as [string, string][]).map(([k, v]) => (
        <li key={k}>{k}: {v}</li>
      ))
    : [];

  const makeupItems: React.ReactNode[] = rec?.makeup
    ? (Object.entries(rec.makeup) as [string, string][]).map(([k, v]) => (
        <li key={k}>{k}: {v}</li>
      ))
    : [];

  return (
    <main className="p-4 font-mono">
      {loading && <RefreshLoader />}
      {!loading && error && <p className="text-red-500">⚠️ {error}</p>}
      {!loading && rec && (
        <>
          <h1 className="text-xl">오늘의 스타일: {rec.style}</h1>
          <img src={img} alt="픽셀 아바타" />

          <h2 className="mt-2">👕 착장</h2>
          <ul>{outfitItems}</ul>

          <h2 className="mt-2">💄 메이크업</h2>
          <ul>{makeupItems}</ul>

          <button onClick={refresh} className="mt-4 p-2 bg-pink-400">
            다시 추천받기
          </button>
        </>
      )}
    </main>
  );
}

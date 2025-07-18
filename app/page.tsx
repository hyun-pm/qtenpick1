'use client';
import { useEffect, useState } from "react";
import { RefreshLoader } from "../components/RefreshLoader";
import React from "react";

export default function Page() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);

    const w = await fetch("/api/weather").then((r) => r.json());
    setWeather(w);

    const r = await fetch("/api/recommend", {
      method: "POST",
      body: JSON.stringify({ weather: w }),
    }).then((r) => r.json());
    setRec(r);

    const im = await fetch("/api/pixel", {
      method: "POST",
      body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
    }).then((r) => r.json());
    setImg(im.imageUrl);

    setLoading(false);
  }

  const outfitItems: React.ReactNode[] = rec
    ? (Object.entries(rec.outfit) as [string, string][]).map(([k, v]) => (
        <li key={k}>{k}: {v}</li>
      ))
    : [];

  const makeupItems: React.ReactNode[] = rec
    ? (Object.entries(rec.makeup) as [string, string][]).map(([k, v]) => (
        <li key={k}>{k}: {v}</li>
      ))
    : [];

  return (
    <main className="p-4 font-mono">
      {loading && <RefreshLoader />}
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

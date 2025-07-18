// app/page.tsx
"use client";
import { useEffect, useState } from "react";

interface Rec {
  style: string;
  outfit: Record<string, string>;
  makeup: Record<string, string>;
}
export default function Home() {
  const [rec, setRec] = useState<Rec | null>(null);
  const [img, setImg] = useState<string>("");
  const [weather, setWeather] = useState<string>("");

  const getRecommend = async () => {
    const res = await fetch("/api/recommend", { method: "POST" });
    const data = await res.json();
    setRec(data);
  };

  const getWeather = async () => {
    const res = await fetch("/api/weather");
    const data = await res.json();
    if (data.weather) setWeather(data.weather);
  };

  const getPixel = async () => {
    if (!rec) return;
    const res = await fetch("/api/pixel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rec),
    });
    const { image } = await res.json();
    setImg(image);
  };

  useEffect(() => {
    getWeather();
    getRecommend();
  }, []);

  useEffect(() => {
    if (rec) getPixel();
  }, [rec]);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6 font-sans text-gray-800">
      <h1 className="text-2xl font-bold">
        오늘의 스타일: <span className="capitalize">{rec?.style}</span>
      </h1>

      {/* 날씨 텍스트 */}
      {weather && (
        <p className="text-gray-500">🌤️ 오늘의 날씨: {weather}</p>
      )}

      {/* 픽셀 이미지 */}
      {img ? (
        <img src={img} alt="픽셀 아바타" className="w-32 h-32 object-contain" />
      ) : (
        <p className="text-yellow-600">⚠️ No image generated</p>
      )}

      {/* 착장 리스트 */}
      {rec && (
        <section>
          <h2 className="text-xl font-semibold">👗 착장</h2>
          <ul className="list-disc ml-6">
            {Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {v}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 메이크업 리스트 */}
      {rec && (
        <section>
          <h2 className="text-xl font-semibold">💄 메이크업</h2>
          <ul className="list-disc ml-6">
            {Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {v}
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        onClick={() => { getRecommend(); }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        다시 추천받기
      </button>
    </main>
  );
}

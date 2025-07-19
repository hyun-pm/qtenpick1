'use client';

import { useEffect, useState } from 'react';

type Outfit = Record<string, string>;
type Makeup = Record<string, string>;

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<{
    style?: string;
    outfit?: Outfit;
    makeup?: Makeup;
    pixelPrompt?: string;
  } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setRec(null);
    setImage(null);

    try {
      const weatherRes = await fetch('/api/weather');
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({
          temp: weatherData.temp,
          style: weatherData.style,
          weatherMain: weatherData.weatherMain,
          description: weatherData.description
        }),
      });

      const recData = await recommendRes.json();
      setRec(recData);

      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        body: JSON.stringify({ prompt: recData.pixelPrompt }),
      });

      const pixel = await pixelRes.json();
      setImage(pixel.image);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 font-sans bg-pink-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-2 font-[Galmuri11]">✨ 오늘의 스타일 ✨</h1>

      {weather && (
        <div className="flex items-center mb-4">
          <img
            src={`/icons/${weather.weatherMain}.png`}
            alt={weather.weatherMain}
            className="w-8 h-8 mr-2"
          />
          <span className="text-xl font-semibold font-[Galmuri11]">
            {weather.description} / {weather.temp}°C
          </span>
        </div>
      )}

      {loading && (
        <div className="my-10 text-center font-[Galmuri11]">⏳ 로딩 중...</div>
      )}

      {!loading && image && (
        <img src={image} alt="추천 캐릭터" className="w-48 h-auto mb-4" />
      )}

      {!loading && rec && (
        <>
          <h2 className="text-xl mt-2 mb-1 font-semibold font-[Galmuri11]">👗 착장</h2>
          <ul className="text-sm leading-6">
            {rec.outfit &&
              Object.entries(rec.outfit as Outfit)
                .filter(([_, v]) => v && v.trim() !== '')
                .map(([key, value]) => (
                  <li key={key}>
                    <b>{key}:</b> {value}
                  </li>
              ))}
          </ul>

          <h2 className="text-xl mt-4 mb-1 font-semibold font-[Galmuri11]">💄 메이크업</h2>
          <ul className="text-sm leading-6">
            {rec.makeup &&
              Object.entries(rec.makeup as Makeup)
                .filter(([_, v]) => v && v.trim() !== '')
                .map(([key, value]) => (
                  <li key={key}>
                    <b>{key}:</b> {value}
                  </li>
              ))}
          </ul>
        </>
      )}

      <button onClick={refresh} className="mt-6">
        <img src="/icons/button.png" alt="다시 추천받기" className="w-32 h-auto" />
      </button>
    </main>
  );
}

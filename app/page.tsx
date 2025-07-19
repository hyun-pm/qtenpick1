'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getStyle = async () => {
    setLoading(true);
    try {
      const lat = 37.5665;
      const lon = 126.9780;

      const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        body: JSON.stringify({
          temp: weatherData.temp,
          description: weatherData.description,
        }),
      });
      const recData = await recRes.json();
      setRec(recData);

      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        body: JSON.stringify({
          pixelPrompt: recData.pixelPrompt,
        }),
      });
      const pixelData = await pixelRes.json();
      setImg(pixelData.image);
    } catch (e) {
      console.error('API Error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStyle();
  }, []);

  const weatherIcon = weather?.description
    ? `/icons/${weather.description.split(' ')[0]}.png`
    : null;

  return (
    <div className="min-h-screen bg-pink-50 text-center px-4 py-8 font-sans">
      <h1 className="text-3xl font-bold text-pink-600 mb-1">오늘의 스타일:</h1>
      {rec && <h2 className="text-2xl font-bold mb-4">"{rec.style}"</h2>}

      <div className="flex justify-center items-center gap-2 mb-4">
        {weatherIcon && (
          <img src={weatherIcon} alt="날씨 아이콘" className="w-6 h-6" />
        )}
        <span>
          현재 날씨: {weather?.description} · {weather?.temp}°C
        </span>
      </div>

      {img && (
        <div className="flex justify-center mb-6">
          <img src={img} alt="추천 아바타" className="w-48 h-auto" />
        </div>
      )}

      {/* 착장 정보 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-pink-500 mb-2">👕 착장</h3>
        <ul className="text-left inline-block ml-4 text-sm leading-6">
          {rec?.outfit &&
            Object.entries(rec.outfit).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v as string}
              </li>
            ))}
        </ul>
      </div>

      {/* 메이크업 정보 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-pink-500 mb-2">💄 메이크업</h3>
        <ul className="text-left inline-block ml-4 text-sm leading-6">
          {rec?.makeup &&
            Object.entries(rec.makeup).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v as string}
              </li>
            ))}
        </ul>
      </div>

      {/* 상품 리스트 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-pink-500 mb-2">🛍️ 관련 상품</h3>
        <div className="flex justify-center gap-4">
          {rec?.items?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="w-[100px] h-[130px] rounded bg-white shadow-md text-xs text-center p-2"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-20 object-cover rounded mb-1"
              />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 다시 추천받기 버튼 */}
      <button onClick={getStyle}>
        <img
          src="/icons/button.png"
          alt="다시 추천받기"
          className="w-32 h-auto mx-auto"
        />
      </button>

      {loading && <p className="mt-4 text-sm text-gray-500">로딩 중...</p>}
    </div>
  );
}

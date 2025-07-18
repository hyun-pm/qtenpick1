'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import './globals.css'; // Tailwind + 폰트 로드
import pixelButton from '/public/button-pixel.png'; // 버튼 이미지 예시
import sunIcon from '/public/sunny-pixel.png'; // 날씨 아이콘 예시

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [img, setImg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const w = await fetch('/api/weather').then(r => r.json());
    setWeather(w);
    const r = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ weather: w }),
    }).then(r => r.json());
    setRec(r);
    const im = await fetch('/api/pixel', {
      method: 'POST',
      body: JSON.stringify({ pixelPrompt: r.pixelPrompt }),
    }).then(r => r.json());
    setImg(im.image);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-pink-50 font-galmuri text-gray-800 p-6">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl text-pink-600 font-bold">오늘의 스타일: <span className="text-black">"{rec?.style}"</span></h1>

        {weather && (
          <div className="mt-2 text-sm flex justify-center items-center gap-2">
            <Image src={sunIcon} alt="sun" width={24} height={24} />
            <span>현재 날씨: {weather.description}, {weather.temp}°C</span>
          </div>
        )}

        {img && (
          <div className="flex justify-center mt-6">
            <Image
              src={img}
              alt="픽셀 아바타"
              width={200}
              height={200}
              className="rounded-lg border-2 border-pink-300"
            />
          </div>
        )}

        {rec && (
          <>
            <div className="mt-8 text-left">
              <h2 className="text-xl text-pink-600 font-bold flex items-center gap-1">👕 착장</h2>
              <ul className="mt-2 ml-2 text-sm leading-6">
                {Object.entries(rec.outfit).map(([k, v]) => (
                  <li key={k}><b>{k}:</b> {v}</li>
                ))}
              </ul>

              <h2 className="text-xl text-pink-600 font-bold flex items-center gap-1 mt-4">💄 메이크업</h2>
              <ul className="mt-2 ml-2 text-sm leading-6">
                {Object.entries(rec.makeup).map(([k, v]) => (
                  <li key={k}><b>{k}:</b> {v}</li>
                ))}
              </ul>
            </div>

            {/* 관련 상품 placeholder */}
            <h2 className="text-lg font-semibold mt-6 text-left ml-2">🛍️ 관련 상품</h2>
            <div className="flex justify-center gap-3 mt-2">
              {['상품명', '상품명', '상품명'].map((name, i) => (
                <div key={i} className="bg-white rounded-xl border shadow-md w-[90px] h-[100px] flex flex-col justify-center items-center text-xs text-gray-600">
                  <div className="w-[60px] h-[60px] bg-gray-200 rounded mb-1" />
                  {name}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center mt-8">
          <button onClick={refresh}>
            <Image src={pixelButton} alt="다시 추천받기" width={150} height={45} />
          </button>
        </div>
      </div>
    </main>
  );
}

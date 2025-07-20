'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [weather, setWeather] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [pixel, setPixel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState('');

  const translateWeatherDescription = (desc: string) => {
    const dict: { [key: string]: string } = {
      'clear sky': '快晴',
      'few clouds': '晴れ時々曇り',
      'scattered clouds': '曇りがち',
      'broken clouds': '曇り',
      'overcast clouds': '曇り',
      'shower rain': 'にわか雨',
      'light rain': '小雨',
      'rain': '雨',
      'thunderstorm': '雷雨',
      'snow': '雪',
      'mist': '霧',
    };
    return dict[desc?.toLowerCase()] || desc;
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    setPixel('');
    setRec(null);

    try {
      const weatherRes = await fetch('/api/weather');
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: weatherData.temp,
          weatherMain: weatherData.main,
          description: weatherData.description,
        }),
      });

      const recommendData = await recommendRes.json();
      if (!recommendData.pixelPrompt) {
        throw new Error('pixelPrompt 누락 - GPT 응답 오류');
      }

      setRec(recommendData);

      const pixelRes = await fetch('/api/pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelPrompt: recommendData.pixelPrompt }),
      });

      const pixelData = await pixelRes.json();
      if (!pixelData.image) {
        throw new Error('픽셀 이미지生成失敗');
      }

      setPixel(pixelData.image);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const refresh = () => {
    fetchAll();
  };

  const getWeatherIcon = (main: string) => {
    const safeMain = main || 'Clear';
    const iconName = safeMain.charAt(0).toUpperCase() + safeMain.slice(1).toLowerCase();
    return `/icons/${iconName}.png`;
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-4 py-8 font-[Galmuri]"
      style={{
        background: 'linear-gradient(to bottom, #FFD5E8, #FFFDED)',
      }}
    >
      <h1
        className="text-2xl font-bold mb-4 text-transparent bg-clip-text"
        style={{
          backgroundImage: 'linear-gradient(to right, #FE2C8F, #FE8DD3)',
        }}
      >
        🎀 今日のスタイル推薦
      </h1>

      {weather && (
        <div className="flex items-center gap-2 mb-4">
          <Image src={getWeatherIcon(weather.main)} alt="天気アイコン" width={40} height={40} />
          <span className="text-sm text-gray-800">
            {translateWeatherDescription(weather.description)} / {weather.temp}°C
          </span>
        </div>
      )}

      {rec?.style && (
        <h2 className="text-lg font-bold text-[#FE2C8F] mb-2">
          スタイル: 「{rec.style}」
        </h2>
      )}

      {loading && <p className="text-center mt-6 text-sm text-gray-500">読み込み中{dots}</p>}
      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

      {/* ✅ 픽셀 프레임 박스로 감싸기 */}
      {!loading && pixel && (
        <div className="relative w-[240px] h-[240px] p-1 bg-[#FFFDED] border-4 border-pink-300 rounded-sm shadow-[inset_0_0_0_2px_white] mb-4">
          <img src={pixel} alt="おすすめキャラ" className="w-full h-full object-contain" />
        </div>
      )}

      {rec && (
        <div className="w-full max-w-xs text-sm mb-6">
          <h3 className="font-semibold text-[#FE2C8F] mb-1">👗 コーディネート</h3>
          <ul className="list-disc ml-4">
            {(Object.entries(rec.outfit) as [string, string][])
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b>: {value}
                </li>
              ))}
          </ul>

          <h3 className="font-semibold text-[#FE2C8F] mt-4 mb-1">💄 メイクアップ</h3>
          <ul className="list-disc ml-4">
            {(Object.entries(rec.makeup) as [string, string][])
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b>: {value}
                </li>
              ))}
          </ul>
        </div>
      )}

      {Array.isArray(rec?.keywords) && rec.keywords.length > 0 && (
        <div className="w-full max-w-xs text-sm mb-8">
          <h3 className="font-semibold text-[#FE2C8F] mb-2">🔍 Qoo10で検索</h3>
          <ul className="list-disc ml-4">
            {rec.keywords.map((kw: string, idx: number) => {
              const safeKeyword = kw?.trim();
              const searchUrl = `https://www.qoo10.jp/s/${encodeURIComponent(safeKeyword)}?keyword=${encodeURIComponent(safeKeyword)}`;
              return (
                <li key={idx}>
                  <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    「{safeKeyword}」 をQoo10で探す
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button onClick={refresh} className="mt-4">
        <Image src="/icons/button.png" alt="もう一度" width={120} height={40} />
      </button>
    </main>
  );
}

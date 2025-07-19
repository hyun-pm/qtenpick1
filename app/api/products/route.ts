import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  const { keywords } = await req.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
  }

  const query = encodeURIComponent(keywords[0]);
  const searchUrl = `https://www.qoo10.jp/gmkt.inc/Search/Search.aspx?keyword=${query}`;

  try {
    const res = await fetch(searchUrl);
    const html = await res.text();
    const $ = cheerio.load(html);
    const items: { name: string; url: string; thumbnail: string }[] = [];

    // ✅ 최신 Qoo10 구조에 맞는 유연한 선택자
    $('a.item_img').each((_, el) => {
      const name = $(el).attr('title')?.trim() || '';
      const href = $(el).attr('href') || '';
      const url = href.startsWith('http') ? href : `https://www.qoo10.jp${href}`;
      const thumb = $(el).find('img').attr('src') || '';

      // ⚠️ 유효한 썸네일만
      if (name && url && thumb && !thumb.includes('blank')) {
        items.push({ name, url, thumbnail: thumb });
      }
    });

    console.log('크롤링된 상품 수:', items.length);
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('크롤링 에러:', err);
    return NextResponse.json({ error: '크롤링 실패', detail: err.message }, { status: 500 });
  }
}

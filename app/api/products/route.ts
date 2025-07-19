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

    $('.search_result_list ul li').each((_, el) => {
      const name = $(el).find('.sbj a').text().trim();
      const href = $(el).find('.sbj a').attr('href') || '';
      const url = href.startsWith('http') ? href : `https://www.qoo10.jp${href}`;
      const thumb = $(el).find('.thumb img').attr('src') || '';

      if (name && url && thumb) {
        items.push({ name, url, thumbnail: thumb });
      }
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: '크롤링 실패', detail: err.message }, { status: 500 });
  }
}


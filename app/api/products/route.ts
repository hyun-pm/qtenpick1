import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  const { keywords } = await req.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
  }

  const keyword = keywords[0];
  const searchUrl = `https://www.qoo10.jp/gmkt.inc/Search/Search.aspx?keyword=${encodeURIComponent(keyword)}`;

  try {
    const browser = await puppeteer.launch({
      headless: 'new', // 최신 puppeteer에서는 'new' 권장
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // 페이지에서 상품 정보 추출
    const items = await page.evaluate(() => {
      const result: { name: string; url: string; thumbnail: string }[] = [];
      const productNodes = document.querySelectorAll('a.item_img');

      productNodes.forEach((el) => {
        const name = el.getAttribute('title')?.trim() || '';
        const href = el.getAttribute('href') || '';
        const url = href.startsWith('http') ? href : `https://www.qoo10.jp${href}`;
        const img = el.querySelector('img');
        const thumbnail = img?.getAttribute('src') || '';

        if (name && url && thumbnail && !thumbnail.includes('blank')) {
          result.push({ name, url, thumbnail });
        }
      });

      return result;
    });

    await browser.close();

    console.log(`🛍️ 크롤링된 상품 수: ${items.length}개 (검색어: ${keyword})`);
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('❌ puppeteer 크롤링 에러:', err);
    return NextResponse.json({ error: '크롤링 실패', detail: err.message }, { status: 500 });
  }
}

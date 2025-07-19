import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function POST(req: Request) {
  const { keywords } = await req.json();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
  }

  const keyword = keywords[0];
  const searchUrl = `https://www.qoo10.jp/gmkt.inc/Search/Search.aspx?keyword=${encodeURIComponent(keyword)}`;

  try {
    const executablePath = await chromium.executablePath;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 20000 });

    const items = await page.evaluate(() => {
      const results: { name: string; url: string; thumbnail: string }[] = [];
      const nodes = document.querySelectorAll('a.item_img');

      nodes.forEach((el) => {
        const name = el.getAttribute('title') || '';
        const href = el.getAttribute('href') || '';
        const url = href.startsWith('http') ? href : `https://www.qoo10.jp${href}`;
        const img = el.querySelector('img');
        const thumbnail = img?.getAttribute('src') || '';

        if (name && url && thumbnail && !thumbnail.includes('blank')) {
          results.push({ name, url, thumbnail });
        }
      });

      return results;
    });

    await browser.close();

    console.log(`✅ 크롤링된 상품 수: ${items.length}개 (검색어: ${keyword})`);
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('❌ puppeteer-core 크롤링 에러:', err);
    return NextResponse.json({ error: '크롤링 실패', detail: err.message }, { status: 500 });
  }
}

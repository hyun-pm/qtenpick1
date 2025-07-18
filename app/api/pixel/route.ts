import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt = body?.pixelPrompt;

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid pixelPrompt' },
      { status: 400 }
    );
  }

  try {
    const res = await openai.images.generate({
      prompt,
      n: 1,
      size: '256x256',
      response_format: 'b64_json',
    });

    // ✅ 에러 방어: 응답 데이터가 없을 경우 처리
    const b64 = res.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json(
        { error: 'No image returned from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Image generation failed',
        message: (e as any)?.message || String(e),
      },
      { status: 500 }
    );
  }
}

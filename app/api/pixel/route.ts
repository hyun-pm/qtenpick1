import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { pixelPrompt } = await req.json();

    if (!pixelPrompt || typeof pixelPrompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid pixelPrompt' }, { status: 400 });
    }

    const fullPrompt = `
      A cute pixel art full-body avatar of a young Korean woman wearing the following outfit and makeup.
      Style: detailed, chibi, maple-style, front-facing, no background, no pose, standing still.

      Outfit:
      ${pixelPrompt}

      Only return the character, no text or additional props. Use white background.
    `.trim();

    const res = await openai.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });

    const imageData = res.data?.[0]?.b64_json;

    if (!imageData) {
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    return NextResponse.json({
      image: `data:image/png;base64,${imageData}`
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Pixel API Error', detail: e.message }, { status: 500 });
  }
}

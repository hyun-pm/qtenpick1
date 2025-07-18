import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = body?.pixelPrompt;

  try {
    const res = await openai.images.generate({
      prompt: prompt || 'pixel style avatar of a person wearing hoodie in casual fashion',
      n: 1,
      size: '256x256',
      response_format: 'b64_json',
    });

    const b64 = res.data[0].b64_json;
    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Image Generation Failed',
        message: (e as any).message,
      },
      { status: 500 }
    );
  }
}

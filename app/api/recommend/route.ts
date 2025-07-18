import { NextResponse } from 'next/server';
import { createLookPrompt } from '../../../lib/gptPrompt';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { weather } = await req.json();
  const prompt = createLookPrompt(weather);

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const json = JSON.parse(res.choices[0].message.content || '{}');
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      {
        error: 'GPT API Error',
        message: (e as any).message,
      },
      { status: 500 }
    );
  }
}

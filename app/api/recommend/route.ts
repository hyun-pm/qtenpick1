import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { weather } = await req.json();
  const prompt = `
You are a fashion assistant. Based on the following weather: ${weather.description}, ${weather.temp}°C,
recommend a Korean street style outfit and matching makeup. Output in this JSON format:

{
  "style": "캐주얼 | 미니멀 | 러블리 | 액티브 중 하나",
  "outfit": {
    "outer": "string",
    "top": "string",
    "bottom": "string",
    "shoes": "string",
    "accessory": "string"
  },
  "makeup": {
    "sunscreen": "string",
    "foundation": "string",
    "eyeshadow": "string",
    "lip": "string",
    "shading": "string",
    "blusher": "string",
    "highlighter": "string"
  },
  "pixelPrompt": "이 outfit과 makeup을 기반으로 한 픽셀 여자 캐릭터의 외형 설명"
}`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const json = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: "GPT API Error", detail: e.message }, { status: 500 });
  }
}

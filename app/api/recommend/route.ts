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
  "pixelPrompt": "픽셀 여성 캐릭터 생성을 위한 영어 프롬프트. 옷/메이크업 포함 설명 문장 1~2줄"
}`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = res.choices[0].message.content || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const json = JSON.parse(cleaned);

    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: "GPT API Error", detail: e.message }, { status: 500 });
  }
}

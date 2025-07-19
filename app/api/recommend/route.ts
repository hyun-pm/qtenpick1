import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, style, weatherMain, description } = body;

    if (!temp || !style || !weatherMain || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gptPrompt = `
오늘 날씨는 ${description}이고 기온은 ${temp}도입니다. 스타일은 ${style}입니다.
이 조건에 어울리는 여성용 착장과 메이크업을 창의적으로 구성하고 아래 JSON 형식으로 정확히 응답해주세요.

{
  "style": "스타일명",
  "outfit": {
    "outer": "...",
    "top": "...",
    "bottom": "...",
    "shoes": "...",
    "accessory": "..."
  },
  "makeup": {
    "sunscreen": "...",
    "foundation": "...",
    "eyeshadow": "...",
    "lip": "...",
    "shading": "...",
    "blusher": "...",
    "highlighter": "..."
  },
  "pixelPrompt": "pixel art style full-body avatar of a stylish young woman wearing (상의), (하의), (액세서리), in (style) fashion. makeup includes (eyeshadow, lip, blusher, foundation). no background. 8-bit sprite. soft pastel tone."
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.1
    });

    const text = completion.choices[0].message.content;
    const parsed = JSON.parse(text || "{}");

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

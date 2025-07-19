import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, style, weatherMain, description } = body;

    if (!temp || !weatherMain || !description || !style) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const gptPrompt = `
날씨: ${description}, 기온: ${temp}도, 스타일: ${style}.
이 조건에 어울리는 여성용 착장과 메이크업을 창의적으로 구성하고, 아래 형식의 JSON으로 응답해.

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
  "pixelPrompt": "pixel art style full-body avatar of a stylish young woman wearing ${상의}, ${하의}, ${액세서리}, in ${style} fashion with ${메이크업 정보들}. pastel tone. soft lighting. no background. 8-bit sprite"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.1
    });

    const text = completion.choices[0].message.content;
    const data = JSON.parse(text || "{}");

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "GPT API Error", detail: (e as any).message }, { status: 500 });
  }
}

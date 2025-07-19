import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, weatherMain, description } = body;

    if (!temp || !weatherMain || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. 스타일 추천 GPT 프롬프트
    const gptPrompt = `
너는 감각 있는 여성 스타일 코디 전문가야.
- 오늘 날씨는 "${description}", 기온은 ${temp}도야.
- 이 조건에 어울리는 스타일 이름(style), 착장(outfit), 메이크업(makeup)을 구성해줘.

[조건]
- 반드시 JSON 형식으로 응답해. 설명은 절대 포함하지 마.
- 모든 필드는 반드시 채워져 있어야 해.
- outer는 ${temp > 20 ? "생략 가능" : "반드시 포함"}.
- makeup 항목은 최소 4개 이상 포함할 것.

[응답 형식]
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
  }
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.3
    });

    const text = completion.choices[0].message.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "GPT returned invalid JSON", raw: text }, { status: 400 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const { style, outfit, makeup } = parsed;

    if (!style || !outfit || !makeup) {
      return NextResponse.json({ error: "Missing style/outfit/makeup" }, { status: 400 });
    }

    // 2. 픽셀 아바타 이미지 프롬프트 생성
    const outfitList = [outfit.top, outfit.bottom, outfit.shoes, outfit.accessory, outfit.outer]
      .filter(Boolean).join(", ");

    const makeupList = [
      makeup.eyeshadow,
      makeup.lip,
      makeup.blusher,
      makeup.foundation,
      makeup.highlighter
    ].filter(Boolean).join(", ");

    const pixelPrompt = `
high-resolution pixel art of a full-body front-facing cute Korean girl character in ${style} fashion.
She is wearing ${outfitList}.
Makeup includes ${makeupList}.
Centered composition, chibi proportions, soft outlines, lovely and modern styling.
8-bit sprite with no background. Soft pastel color palette.
Inspired by MapleStory avatars and You.and.d OOTD pixel art collection.
    `.trim();

    // 3. 상품 검색용 키워드 구성
    const keywords = [
      style,
      outfit.top,
      outfit.bottom,
      outfit.shoes,
      outfit.accessory,
      makeup.eyeshadow,
      makeup.lip,
      makeup.blusher,
      makeup.foundation
    ].filter(Boolean);

    return NextResponse.json({
      style,
      outfit,
      makeup,
      pixelPrompt,
      keywords
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

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

    // ✅ GPT 프롬프트
    const gptPrompt = `
너는 감각 있는 여성 스타일 코디 전문가야.
- 오늘 날씨는 "${description}", 기온은 ${temp}도야.
- 이 조건에 어울리는 스타일 이름(style), 착장(outfit), 메이크업(makeup), 그리고 Qoo10 상품 3~5개를 추천해줘.

[조건]
- JSON 형식으로만 응답해. 설명 절대 금지.
- 모든 필드는 반드시 채워져야 해.
- outer는 ${temp > 20 ? "생략 가능" : "반드시 포함"}.
- makeup 항목은 최소 4개 이상 포함.
- products 항목은 다음 구조의 배열로 제공:

"products": [
  {
    "name": "상품 이름",
    "url": "상품 링크 (Qoo10에서 검색 또는 직접 링크)",
    "thumbnail": "상품 썸네일 URL (가능한 경우)"
  }
]
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
    const { style, outfit, makeup, products } = parsed;

    if (!style || !outfit || !makeup || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Missing style/outfit/makeup/products" }, { status: 400 });
    }

    // ✅ 픽셀 캐릭터 이미지 프롬프트 생성 (안전성 향상 + 완성도 보장)
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
pastel pixel art of a full-body front-facing cute Korean girl character in ${style} style.
She is wearing ${outfitList}.
Makeup includes ${makeupList}.
Centered, chibi proportions, soft outlines.
Modern styling, 8-bit sprite, no background.
Inspired by MapleStory avatars and You.and.d pixel art.
    `.trim();

    return NextResponse.json({
      style,
      outfit,
      makeup,
      pixelPrompt,
      products
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}
}

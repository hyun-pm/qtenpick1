import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, weatherMain, description } = body;

    if (!temp || !weatherMain || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const gptPrompt = `
너는 창의적이고 실용적인 여성 스타일 추천 전문가야.
- 현재 날씨는 "${description}", 기온은 ${temp}도야.
- 이 조건에 어울리는 스타일 이름을 정하고, 그 스타일에 맞는 여성 착장(outfit)과 메이크업(makeup)을 추천해줘.

[조건]
- JSON 형식으로만 응답해.
- 설명 절대 포함하지 마.
- 각 필드는 비어있거나 누락되면 안돼.
- outer는 ${temp > 20 ? "생략 가능" : "반드시 포함"}.
- makeup 항목은 실제 상황에 맞춰 자유롭게 구성.

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
      temperature: 1.2,
    });

    const text = completion.choices[0].message.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "GPT returned invalid JSON", raw: text },
        { status: 400 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const { style, outfit, makeup } = parsed;

    if (!style || !outfit || !makeup) {
      return NextResponse.json({ error: "Missing style/outfit/makeup" }, { status: 400 });
    }

    // ✅ pixelPrompt를 직접 구성
    const makeupList = [
      makeup.eyeshadow,
      makeup.lip,
      makeup.blusher,
      makeup.foundation
    ].filter(Boolean).join(", ");

    const outfitList = [
      outfit.top,
      outfit.bottom,
      outfit.shoes,
      outfit.accessory,
      outfit.outer
    ]
      .filter(Boolean)
      .join(", ");

    const pixelPrompt = `pixel art style full-body avatar of a stylish young woman wearing ${outfitList}, in ${style} fashion. makeup includes ${makeupList}. pastel color. 8-bit sprite. no background.`;

    return NextResponse.json({
      style,
      outfit,
      makeup,
      pixelPrompt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

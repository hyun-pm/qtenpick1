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
아래 조건에 맞는 착장과 메이크업을 자유롭게 구성해주세요.
모든 항목은 실제로 존재할 법한 여성 캐릭터 기반이며, 날씨와 계절에 따라 아우터는 생략해도 되고, 메이크업 항목도 상황에 따라 빠질 수 있습니다.

아래 JSON 형식으로만 응답해주세요:

{
  "style": "스타일명",
  "outfit": {
    "outer": "생략 가능",
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
    "blusher": "(없으면 null 또는 \"\")",
    "highlighter": "(없으면 null 또는 \"\")"
  },
  "pixelPrompt": "배경 없는 pixel art 스타일의 전신 아바타. 상의, 하의, 신발, 액세서리, 메이크업(아이섀도우, 립 포함)을 모두 반영. 스타일: ${style}. 8비트, 소프트 파스텔톤, 여성 캐릭터, 단 하나의 이미지."
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.2,
    });

    const rawText = completion.choices[0].message.content ?? "";

    // JSON 응답만 추출 (앞뒤 공백, 코드블록 제거 등)
    const jsonText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

// app/api/recommend/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, style, weatherMain, description } = body;

    if (!temp || !style || !weatherMain || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const gptPrompt = `
현재 날씨는 "${description}"이고 기온은 ${temp}도입니다. 오늘의 스타일 키워드는 "${style}"입니다.

이 정보를 바탕으로 아래 조건에 따라 여성 캐릭터에 어울리는 착장(outfit)과 메이크업(makeup)을 창의적이고 현실감 있게 추천해주세요:

- 20도 이상일 경우 아우터(outer)는 생략해도 됩니다.
- 해당 날씨에서 불필요한 메이크업 항목(예: highlighter, blusher 등)은 생략 가능합니다.
- 착장과 메이크업 결과는 실제로 존재할 수 있는 현실적인 조합으로 구성해주세요.
- 결과는 **정확히 아래 JSON 형식으로** 응답해주세요.

JSON 형식 예시:
{
  "style": "러블리",
  "outfit": {
    "top": "핑크 셔링 블라우스",
    "bottom": "화이트 플레어 스커트",
    "shoes": "베이지 플랫슈즈",
    "accessory": "진주 귀걸이"
  },
  "makeup": {
    "sunscreen": "SPF50+ 선크림",
    "foundation": "가벼운 파운데이션",
    "eyeshadow": "핑크 베이지 섀도우",
    "lip": "코랄 틴트",
    "blusher": "은은한 핑크 블러셔"
  },
  "pixelPrompt": "pixel art full-body avatar of a stylish young woman wearing a 핑크 셔링 블라우스, 화이트 플레어 스커트, 진주 귀걸이 in 러블리 fashion, with 핑크 베이지 섀도우, 코랄 틴트, 은은한 핑크 블러셔, and 가벼운 파운데이션 makeup. soft pastel tone. 8-bit sprite. no background."
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.1,
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content || "{}");

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}


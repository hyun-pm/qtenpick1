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
너는 패션 코디네이터야. 오늘 날씨는 ${description}이며 기온은 ${temp}도야. 사용자는 ${style} 스타일을 원해.
이 조건에 맞는 창의적이고 다양성 있는 여성 착장과 메이크업을 추천해줘.

- JSON 형식으로 정확히 응답해
- 각 항목은 비어 있거나 누락되면 안돼
- 착장은 outer는 ${temp > 20 ? "생략 가능" : "반드시 포함"}, top, bottom, shoes, accessory는 반드시 포함
- 메이크업은 필요한 항목만 포함 (예: shading, blusher, highlighter는 조건에 따라 생략 가능)
- 반드시 JSON으로만 응답해야 함
- 마지막 pixelPrompt는 추천된 top, bottom, accessory, style, makeup 값을 포함해서 작성해야 함

응답 형식:
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
  "pixelPrompt": "pixel art style full-body avatar of a stylish young woman wearing white blouse, beige slacks, gold earrings in lovely fashion. makeup includes brown eyeshadow, pink lip, light blusher. pastel tone. no background. 8-bit sprite."
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.2
    });

    const text = completion.choices[0].message.content ?? "";

    // JSON 문자열 추출 시 안전하게 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "GPT returned invalid JSON", raw: text }, { status: 400 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.pixelPrompt || typeof parsed.pixelPrompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid pixelPrompt", raw: parsed }, { status: 400 });
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

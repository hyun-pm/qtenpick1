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
너는 전문적인 여성 패션 스타일 추천 코디네이터야.
- 오늘 날씨는 "${description}"이며, 기온은 ${temp}도야.
- 사용자가 원하는 스타일은 "${style}"이야.
- 이 조건에 어울리는 여성용 착장과 메이크업을 구성해줘.

규칙:
- 반드시 JSON 형식으로 응답해. 설명 없이 JSON만 출력해.
- 각 필드는 비어있거나 생략되면 안돼. (단, outer는 ${temp > 20 ? "생략 가능" : "반드시 포함"})
- makeup은 필요한 항목만 포함하되, 빠지면 안 돼.
- 마지막 pixelPrompt는 추천된 outfit과 makeup 정보를 바탕으로 구성해.
- pixelPrompt에는 top, bottom, accessory, style, 메이크업을 자연스럽게 반영할 것.

반드시 아래 형식으로 응답해:
{
  "style": "",
  "outfit": {
    "outer": "",
    "top": "",
    "bottom": "",
    "shoes": "",
    "accessory": ""
  },
  "makeup": {
    "sunscreen": "",
    "foundation": "",
    "eyeshadow": "",
    "lip": "",
    "shading": "",
    "blusher": "",
    "highlighter": ""
  },
  "pixelPrompt": ""
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.2
    });

    const text = completion.choices[0].message.content ?? "";
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

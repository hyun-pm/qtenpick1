import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { temp, style, weatherMain, description } = body;

    if (!temp || !style || !weatherMain || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const gptPrompt = `
너는 창의적이고 실용적인 여성 스타일 추천 전문가야.
- 현재 날씨는 "${description}", 기온은 ${temp}도야.
- 사용자는 "${style}" 스타일을 원해.
- 이 조건에 어울리는 여성용 착장과 메이크업을 추천하고, 해당 내용을 기반으로 픽셀 캐릭터 이미지를 만들기 위한 프롬프트도 함께 생성해.

[조건]
- 반드시 JSON 형식으로 응답해. 설명은 절대 포함하지 마.
- 각 필드는 빠짐없이 채워져야 함. 단, outer는 ${temp > 20 ? "기온이 높기 때문에 생략 가능" : "반드시 포함"}.
- makeup 항목들은 실제 필요한 경우에만 포함. 누락되면 안 됨.
- 마지막 pixelPrompt는 위 추천 내용을 자연스럽게 반영한 영어 프롬프트여야 하며, 다음 조건을 만족해야 함:
  - pastel color 8-bit sprite
  - no background
  - full-body avatar
  - makeup 포함
  - 스타일 이름 포함

[응답 형식]
{
  "style": "Lovely",
  "outfit": {
    "outer": "white cardigan",
    "top": "floral pink blouse",
    "bottom": "white pleated mini skirt",
    "shoes": "pastel pink ballet flats",
    "accessory": "flower hairpin and pearl earrings"
  },
  "makeup": {
    "sunscreen": "SPF50+ lightweight sunblock",
    "foundation": "glow finish cushion foundation",
    "eyeshadow": "soft coral shimmer",
    "lip": "rosy pink gloss",
    "shading": "light brown shading",
    "blusher": "peach tone cream blush",
    "highlighter": "champagne shimmer on cheekbones"
  },
  "pixelPrompt": "pixel art style full-body avatar of a stylish young woman wearing a floral pink blouse, white pleated skirt, pastel pink ballet flats, with flower hairpin and pearl earrings, in Lovely fashion. makeup includes coral shimmer eyeshadow, rosy pink lip, peach blush. no background. pastel tone. 8-bit sprite."
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.2
    });

    const text = completion.choices[0].message.content ?? "";

    // JSON 블록만 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "GPT returned invalid JSON", raw: text },
        { status: 400 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.pixelPrompt || typeof parsed.pixelPrompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid pixelPrompt", raw: parsed },
        { status: 400 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

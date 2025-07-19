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
- 이 조건에 어울리는 스타일 이름을 직접 정하고, 그 스타일에 맞는 여성 착장과 메이크업을 추천해줘.
- 마지막으로 추천된 정보들을 기반으로 픽셀 캐릭터 이미지를 만들기 위한 영어 프롬프트도 생성해줘.

[조건]
- 반드시 JSON 형식으로만 응답해. 설명 절대 금지.
- 각 필드는 비어있거나 누락되면 안돼. 단, outer는 ${temp > 20 ? "기온이 높기 때문에 생략 가능" : "반드시 포함"}.
- makeup 항목들은 필요한 경우에만 포함하되, 전체적으로 적절한 구성을 보여줘.
- pixelPrompt는 반드시 영어로 작성하고 다음 조건을 포함해야 해:
  - pastel color 8-bit sprite
  - no background
  - full-body avatar
  - outfit과 makeup이 반영된 묘사
  - 생성한 style 이름도 반영

[응답 형식 예시]
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

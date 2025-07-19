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

    // ✅ 프롬프트 강화: JSON 문법 엄격히 지시
    const gptPrompt = `
너는 감각 있는 여성 스타일 코디 전문가야.
- 오늘 날씨는 "${description}", 기온은 ${temp}도야.
- 이 조건에 어울리는 스타일 이름(style), 착장(outfit), 메이크업(makeup), Qoo10 Japan에서 구매할 수 있는 상품 3~5개, 그리고 검색 키워드 배열을 추천해줘.

[조건]
- 반드시 유효한 JSON 객체 형식으로만 응답해.
- JSON 문자열이 아니라 실제 JSON 객체로 응답해야 해.
- 설명, 줄바꿈 없이 한 줄로만 출력하고, 문장은 절대 포함하지 마.
- 모든 문자열은 쌍따옴표("")로 감싸야 하고, 각 항목 뒤에 **마지막 쉼표는 절대 넣지 마.**
- 특히 "thumbnail" 필드는 쌍따옴표로 정확히 닫아야 하고 괄호나 기호가 뒤에 붙으면 안 돼.
- 응답 예시:

{"style":"러블리","outfit":{"top":"화이트 블라우스","bottom":"플로럴 스커트","shoes":"메리제인 구두","accessory":"리본 머리핀","outer":"라이트 카디건"},"makeup":{"foundation":"글로우 쿠션","blusher":"핑크톤 블러셔","lip":"틴트 립","eyeshadow":"코랄 섀도우","highlighter":"은은한 하이라이터"},"products":[{"name":"플로럴 미디 스커트","url":"https://www.qoo10.jp/item/XXXXX","thumbnail":"https://image.qoo10.jp/item1.jpg"}],"keywords":["플로럴 스커트","틴트 립","리본 머리핀"]}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.3,
    });

    const text = completion.choices[0].message.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "GPT returned invalid JSON", raw: text }, { status: 400 });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err: any) {
      return NextResponse.json({
        error: "GPT JSON Parse Error",
        raw: jsonMatch[0],
        detail: err.message
      }, { status: 400 });
    }

    const { style, outfit, makeup, products, keywords } = parsed;

    if (!style || !outfit || !makeup || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Missing style/outfit/makeup/products" }, { status: 400 });
    }

    // ✅ 픽셀 캐릭터 이미지 프롬프트 생성
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
      products,
      keywords: Array.isArray(keywords) ? keywords : []
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

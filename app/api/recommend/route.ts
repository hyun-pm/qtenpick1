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

    // ✅ 프롬프트 최적화: 짧고 안정적인 응답 유도
    const gptPrompt = `
너는 센스 있는 여성 패션 코디네이터야.
- 오늘 날씨는 "${description}", 기온은 ${temp}도야.
- 이 조건에 어울리는 스타일 이름(style), 착장(outfit), 메이크업(makeup), Qoo10 Japan에서 구매할 수 있는 관련 상품 3~5개(products), 검색 키워드 배열(keywords)을 추천해줘.

[응답 조건]
- 반드시 유효한 JSON 객체 하나만 응답해. 설명이나 문장은 절대 포함하지 마.
- 모든 항목은 쌍따옴표("")로 감싸고, 마지막 항목 뒤에 쉼표 넣지 마.
- 상품 이름과 키워드는 간결하고 10자 이내로.
- URL은 실제처럼 보이는 https://www.qoo10.jp/item/12345 형식.
- 이미지 링크도 https://image.qoo10.jp/... 형식처럼 보이게 구성해.
- 의미 없는 문자나 광고 스타일 텍스트, 오타는 절대 넣지 마.

[응답 예시]
{"style":"러블리","outfit":{"top":"화이트 블라우스","bottom":"플로럴 스커트","shoes":"메리제인 구두","accessory":"리본 머리핀","outer":"라이트 카디건"},"makeup":{"foundation":"촉촉 쿠션","blusher":"핑크 블러셔","lip":"틴트 립","eyeshadow":"코랄 섀도우","highlighter":"하이라이터"},"products":[{"name":"미디 스커트","url":"https://www.qoo10.jp/item/12345","thumbnail":"https://image.qoo10.jp/item1.jpg"}],"keywords":["블라우스","스커트","틴트"]}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.1,
      max_tokens: 500, // ✅ 응답 길이 제한 → 로딩 시간 감소
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

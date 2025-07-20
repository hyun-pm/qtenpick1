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

    // ✅ GPT 프롬프트: Qoo10 상세페이지 링크 생성 유도
    const gptPrompt = `
あなたは日本の女性向けファッションコーディネーターであり、Qoo10 Japanで人気商品にも詳しいです。
- 今日の天気は「${description}」、気温は${temp}度です。
- この条件に合うスタイル名(style)、コーディネート(outfit)、メイクアップ(makeup)、そしてQoo10 Japanで実際に販売されていそうな商品のリンク(products)を3〜5件生成してください。

[出力形式]
- 有効なJSONオブジェクト1つだけで応答してください。説明文は禁止。
- 商品(products)は以下の形式で：
  {
    "name": "商品名（日本語）",
    "url": "https://www.qoo10.jp/item/xxxxx"
  }
- 実際に存在するURL構造にしてください（例: https://www.qoo10.jp/item/123456789）
- 特殊記号、広告的な文言、絵文字は禁止。
- 最後の要素にカンマをつけないでください。

[JSON出力例]
{
  "style": "カジュアルガーリー",
  "outfit": {
    "top": "白いブラウス",
    "bottom": "チェック柄スカート",
    "shoes": "ローファー",
    "accessory": "パールイヤリング",
    "outer": "ライトカーディガン"
  },
  "makeup": {
    "foundation": "ナチュラルクッションファンデ",
    "blusher": "ピンクチーク",
    "lip": "水光ティント",
    "eyeshadow": "ブラウンアイシャドウ",
    "highlighter": "ハイライト"
  },
  "products": [
    {
      "name": "ブラウス レディース 春",
      "url": "https://www.qoo10.jp/item/1163682568"
    }
  ]
}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.1,
      max_tokens: 600,
    });

    const text = completion.choices[0].message.content ?? "";
    console.log("📦 GPT 응답 원문:", text);

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
        detail: err.message,
      }, { status: 400 });
    }

    console.log("✅ 파싱된 GPT 응답:", parsed);

    const { style, outfit, makeup, products } = parsed;

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
      makeup.highlighter,
    ].filter(Boolean).join(", ");

    const pixelPrompt = `
pastel pixel art of a full-body front-facing cute Japanese girl character in ${style} style.
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
      keywords: [], // (이제 사용 안함)
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

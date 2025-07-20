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

    // ✅ GPT 프롬프트: Qoo10 검색 키워드 기반 추천
    const gptPrompt = `
あなたは日本の女性向けファッションコーディネーターです。
- 今日の天気は「${description}」、気温は${temp}度です。
- この条件に合うスタイル(style)、コーディネート(outfit)、メイクアップ(makeup)、そしてQoo10 Japanで検索に使えるキーワード配列(keywords)を提案してください。

[出力形式]
- 有効なJSONオブジェクト1つのみを返してください。説明は禁止です。
- keywordsは日本語で、10文字以内の汎用的な単語を最大5件。
- 広告文や絵文字、特殊文字は禁止です。

[例]
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
  "keywords": ["ブラウス", "スカート", "ティント"]
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

    const { style, outfit, makeup, keywords } = parsed;

    // ✅ 키워드 검증 보강: 1~20자, 일본어 또는 영숫자
    const validKeywords = Array.isArray(keywords)
      ? keywords.filter(
          (kw) =>
            typeof kw === "string" &&
            kw.trim().length > 0 &&
            kw.trim().length <= 20 &&
            /^[\p{L}\p{N}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]+$/u.test(kw.trim())
        )
      : [];

    if (!style || !outfit || !makeup || validKeywords.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid style/outfit/makeup/keywords" },
        { status: 400 }
      );
    }

    // ✅ 픽셀 프롬프트 생성
    const outfitList = [outfit.top, outfit.bottom, outfit.shoes, outfit.accessory, outfit.outer]
      .filter(Boolean)
      .join(", ");
    const makeupList = [
      makeup.eyeshadow,
      makeup.lip,
      makeup.blusher,
      makeup.foundation,
      makeup.highlighter,
    ]
      .filter(Boolean)
      .join(", ");

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
      keywords: validKeywords,
      products: [], // deprecated
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

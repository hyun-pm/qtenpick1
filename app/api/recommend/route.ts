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

    // ✅ 프롬프트 수정: 일본어 키워드 생성 유도
    const gptPrompt = `
あなたはセンスのある日本の女性向けファッションコーディネーターです。
- 今日の天気は「${description}」、気温は${temp}度です。
- この条件に合うスタイル名(style)、コーディネート(outfit)、メイクアップ(makeup)、そしてQoo10 Japanで検索に使えるキーワード配列(keywords)を提案してください。

[出力条件]
- 有効なJSONオブジェクト1つだけを応答してください。説明や文章は禁止。
- すべてのキーと値はダブルクォーテーションで囲んでください。
- 最後の要素の後にカンマを入れないでください。
- キーワードは必ず**日本語**で、5〜10文字以内で最大5個まで生成してください。
- 存在しない単語、広告文、特殊文字を含めないこと。
- 例：「ブラウス」「スカート」「スニーカー」「リップ」「カーディガン」

[JSON出力例]
{"style":"ガーリー","outfit":{"top":"白ブラウス","bottom":"花柄スカート","shoes":"パンプス","accessory":"リボンヘアピン","outer":"カーディガン"},"makeup":{"foundation":"ツヤ肌クッション","blusher":"ピンクチーク","lip":"ティントリップ","eyeshadow":"コーラルシャドウ","highlighter":"ハイライト"},"keywords":["ブラウス","スカート","リップ"]}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: gptPrompt }],
      temperature: 1.1,
      max_tokens: 500,
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

    const { style, outfit, makeup, keywords } = parsed;

    if (!style || !outfit || !makeup || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "Missing style/outfit/makeup/keywords" }, { status: 400 });
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
      products: [], // GPT가 생성 안 하므로 비워둠
      keywords: Array.isArray(keywords) ? keywords : []
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: error.message },
      { status: 500 }
    );
  }
}

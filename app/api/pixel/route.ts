// app/api/pixel/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.pixelPrompt;

    if (!prompt) {
      return NextResponse.json({ error: "Missing pixelPrompt" }, { status: 400 });
    }

    // 📌 문자열 그대로 사용해서 프롬프트 구성
    const actualPrompt = `
      pixel art style full-body avatar of a stylish Korean woman.
      ${prompt}
      Minimal background, clean pixel style.
    `.replace(/\s+/g, " ").trim();

    const res = await openai.images.generate({
      prompt: actualPrompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json",
    });

    const b64 = res.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json({ error: "No image returned from OpenAI" }, { status: 500 });
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Pixel API Error", detail: e.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createLookPrompt } from "../../../lib/gptPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { weather } = await req.json();
    const prompt = createLookPrompt(weather);
    if (!prompt) throw new Error("Prompt is null");

    const res = await openai.chat.completions.create({
      model: "gpt-4", // 또는 gpt-3.5-turbo
      messages: [{ role: "user", content: prompt }],
    });

    const raw = res.choices?.[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "GPT 응답이 비어 있습니다." }, { status: 500 });
    }

    // 🔧 코드블럭 제거
    const clean = raw.replace(/```json\n?|```/g, "").trim();

    try {
      const json = JSON.parse(clean);
      return NextResponse.json(json);
    } catch (parseErr) {
      return NextResponse.json({ error: "GPT returned invalid JSON", raw }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "GPT API Error",
        message: err?.message || "Unknown error",
        code: err?.code,
        full: JSON.stringify(err),
      },
      { status: 500 }
    );
  }
}

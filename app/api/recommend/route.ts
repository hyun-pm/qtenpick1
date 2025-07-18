import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createLookPrompt } from "../../../lib/gptPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { weather } = await req.json();
    const prompt = createLookPrompt(weather);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is null" }, { status: 400 });
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const content = res.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        error: "No content returned by GPT",
        rawResponse: JSON.stringify(res),
      }, { status: 500 });
    }

    let json;
    try {
      json = JSON.parse(content);
    } catch (err) {
      return NextResponse.json({
        error: "GPT returned invalid JSON",
        raw: content,
      }, { status: 500 });
    }

    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "GPT API Error",
        message: error.message,
        code: error.code,
        full: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

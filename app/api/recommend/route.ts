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

    const content = res.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No content from GPT" }, { status: 500 });
    }

    const json = JSON.parse(content);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", detail: (error as any).message },
      { status: 500 }
    );
  }
}

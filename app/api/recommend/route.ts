import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createLookPrompt } from "../../../lib/gptPrompt";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { weather } = await req.json();
  const prompt = createLookPrompt(weather);
  if (!prompt) throw new Error("Prompt is null");

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt as string }],
  });

  const json = JSON.parse(res.choices[0].message.content);
  return NextResponse.json(json);
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { pixelPrompt } = await req.json();

    if (!pixelPrompt) {
      return NextResponse.json({ error: "Missing pixelPrompt" }, { status: 400 });
    }

    const response = await openai.images.generate({
      prompt: pixelPrompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json"
    });

    const image = response.data[0]?.b64_json;
    return NextResponse.json({ image: `data:image/png;base64,${image}` });
  } catch (e) {
    return NextResponse.json({ error: "Pixel API Error", detail: (e as any).message }, { status: 500 });
  }
}

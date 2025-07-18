import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { pixelPrompt, outfit, style, makeup } = body;

  try {
    const fullPrompt = pixelPrompt && pixelPrompt.length > 10
      ? pixelPrompt
      : `
        A full-body pixel art avatar of a young woman in cute, detailed pixel style. 
        Wearing ${outfit.outer}, ${outfit.top}, and ${outfit.bottom} in a ${style} fashion style. 
        She wears ${outfit.shoes} and accessories like ${outfit.accessory}. 
        Her makeup includes ${makeup.foundation}, ${makeup.eyeshadow}, ${makeup.lip}, and ${makeup.blusher}. 
        Please draw her in charming Korean pixel-art style with big shiny eyes and soft hair.
        White background. 32-bit dot pixel style.`;

    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64 = res.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image generation failed");

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Pixel API Error", detail: e.message },
      { status: 500 }
    );
  }
}

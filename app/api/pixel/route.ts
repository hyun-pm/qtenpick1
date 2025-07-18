import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { pixelPrompt } = await req.json();

  const prompt = pixelPrompt?.length > 10
    ? pixelPrompt
    : `도트풍 귀여운 여성 아바타. 메이플스토리 스타일. 정면, 전체 신체, 옷과 메이크업이 잘 보이게, 흰 배경`;

  try {
    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
    });

    const b64 = res.data?.[0]?.b64_json;
    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (e: any) {
    return NextResponse.json({ error: "Pixel API Error", detail: e.message }, { status: 500 });
  }
}

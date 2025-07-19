import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { pixelPrompt } = await req.json();

    if (!pixelPrompt || typeof pixelPrompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid pixelPrompt" }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: "dall-e-3", // ✅ 고품질 픽셀 이미지 생성을 위해 DALL·E 3 사용 (명시)
      prompt: pixelPrompt,
      n: 1,
      size: "1024x1024", // 정사각형 이미지, 잘림 최소화
      response_format: "b64_json"
    });

    const data = response.data;

    if (!data || !data[0]?.b64_json) {
      return NextResponse.json({ error: "No image returned from OpenAI" }, { status: 500 });
    }

    const image = data[0].b64_json;

    return NextResponse.json({ image: `data:image/png;base64,${image}` });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Pixel API Error", detail: e.message },
      { status: 500 }
    );
  }
}

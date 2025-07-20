import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { pixelPrompt } = await req.json();

    if (!pixelPrompt || typeof pixelPrompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid pixelPrompt" }, { status: 400 });
    }

    // ✅ DALL·E 3 사용하여 단일 픽셀 이미지 생성
    const response = await openai.images.generate({
      model: "dall-e-3", // 고품질 픽셀 이미지 생성을 위해 DALL·E 3 명시
      prompt: pixelPrompt,
      n: 1, // 무조건 1개의 이미지 생성
      size: "1024x1024", // 정사각형 이미지 → 잘림 방지
      response_format: "b64_json",
    });

    const imageData = response.data?.[0]?.b64_json;

    if (!imageData) {
      return NextResponse.json(
        { error: "No image returned from OpenAI" },
        { status: 500 }
      );
    }

    // ✅ Base64 형식으로 프론트에 전달
    return NextResponse.json({
      image: `data:image/png;base64,${imageData}`,
    });

  } catch (e: any) {
    return NextResponse.json(
      { error: "Pixel API Error", detail: e.message },
      { status: 500 }
    );
  }
}

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

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid pixelPrompt" },
        { status: 400 }
      );
    }

    const pixelPrompt = `
도트 스타일의 귀엽고 여성스러운 픽셀 아바타. ${
      prompt.length > 5 ? prompt : ""
    }
아바타는 전체 모습이 보이고 배경은 단색입니다. 
눈에 띄는 헤어스타일과 메이크업, 착장이 잘 드러나야 합니다. 
MapleStory 또는 Pokédoll 같은 도트풍 스타일. 
8비트 도트 그래픽 느낌. 
`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: pixelPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64 = response.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json(
        { error: "Pixel API Error", detail: "No image returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Pixel API Error", detail: e.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pixelPrompt } = await req.json();
  if (!pixelPrompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `8-bit pixel art avatar, ${pixelPrompt}, front-facing, white background`,
        n: 1,
        size: "512x512",
      }),
    });

    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (e) {
    return NextResponse.json({ error: "Image generation error" }, { status: 500 });
  }
}

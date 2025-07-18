import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { pixelPrompt } = await req.json();
  const prompt = `8-bit pixel art avatar, ${pixelPrompt}, front-facing, white background`;
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "512x512" }),
  });
  const data = await res.json();
  return NextResponse.json({ imageUrl: data.data[0]?.url });
}

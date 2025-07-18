import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { weather } = await req.json();
  const { temp, description } = weather;

  const prompt = `
You are a fashion and beauty stylist assistant. Based on the following weather:

- Temperature: ${temp}°C
- Weather Description: ${description}

Recommend:
1. A style name (e.g., 캐주얼, 러블리, 미니멀).
2. An outfit suited to the temperature (e.g., no outer if over 28°C).
3. A diverse and creative makeup set.
4. A single, natural language prompt to generate a pixel-art female character that reflects the full look.

Return in raw JSON format like:
{
  "style": "캐주얼",
  "outfit": {
    "outer": "...",
    "top": "...",
    "bottom": "...",
    "shoes": "...",
    "accessory": "..."
  },
  "makeup": {
    "sunscreen": "...",
    "foundation": "...",
    "eyeshadow": "...",
    "lip": "...",
    "shading": "...",
    "blusher": "...",
    "highlighter": "..."
  },
  "pixelPrompt": "도트풍 귀엽고 디테일한 여성 캐릭터, ${description} 날씨에 어울리는 ${temp}도 날씨, ${style} 스타일 룩과 ${makeup.lip} 메이크업 포함, 포켓돌/메이플 느낌"
}
`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    const raw = completion.choices[0].message.content || "";
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      {
        error: "GPT API Error",
        detail: (e as any).message
      },
      { status: 500 }
    );
  }
}

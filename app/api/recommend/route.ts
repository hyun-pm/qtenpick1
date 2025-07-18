import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { weather } = await req.json();
  const { temp, description } = weather;

  const prompt = `
You are a fashion and beauty stylist AI. Based on the current weather, suggest a complete outfit and makeup look for a trendy Korean woman.

Current weather:
- Temperature: ${temp}°C
- Description: ${description}

Requirements:
1. Style name: 캐주얼, 미니멀, 러블리, 액티브 등 중 1개.
2. Outfit must include: top, bottom, shoes, accessory.
3. If temperature is below 22°C, include outerwear. If above, omit it or use lightweight optional outer.
4. Makeup: recommend creative and season-appropriate items across sunscreen, foundation, eyeshadow, lip, shading, blusher, highlighter.
5. Return JSON only — no markdown, no explanations.

Include in the JSON a pixelPrompt field that is a natural English sentence describing the full-body appearance of a pixel avatar with the chosen outfit and makeup, suitable for DALL·E generation (MapleStory-style, white background, full body, cute).

Format:
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
  "pixelPrompt": "A Korean girl in pixel art wearing ... with ... makeup, in cute MapleStory style, white background."
}
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = res.choices[0].message.content || "";

    const cleaned = raw.replace(/```json|```/g, "").trim();

    const json = JSON.parse(cleaned);

    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json(
      { error: "GPT API Error", detail: e.message },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { temp, weatherMain, style } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const prompt = `
현재 날씨는 ${weatherMain}, 기온은 ${temp}도입니다.
이 날씨에 어울리는 "${style}" 스타일의 여성 착장과 메이크업을 추천해주세요.

[착장 항목]
- outer
- top
- bottom
- shoes
- accessory

[메이크업 항목]
- sunscreen
- foundation
- eyeshadow
- lip
- shading
- blusher
- highlighter

결과는 아래 형식의 JSON으로만 반환해주세요:
{
  "style": "${style}",
  "outfit": {
    ...
  },
  "makeup": {
    ...
  },
  "pixelPrompt": "..."
}
`;

  try {
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.85,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const gptData = await gptRes.json();
    const content = gptData.choices?.[0]?.message?.content;

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: "GPT API Error", detail: (e as any).message }, { status: 500 });
  }
}

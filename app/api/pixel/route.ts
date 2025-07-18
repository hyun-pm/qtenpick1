// app/api/pixel/route.ts
import { OpenAIApi, Configuration } from "openai";

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const client = new OpenAIApi(config);

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = body?.pixelPrompt;
  const actualPrompt =
    prompt && prompt.length > 10
      ? prompt
      : `pixel style avatar of a person wearing ${
          body.outfit.top
        } and ${body.outfit.bottom} in ${body.style} fashion`;
  const res = await client.createImage({
    prompt: actualPrompt,
    n: 1,
    size: "256x256",
    response_format: "b64_json",
  });
  const b64 = res.data.data[0].b64_json;
  return new Response(JSON.stringify({ image: `data:image/png;base64,${b64}` }));
}

import { OpenAIAPI, Configuration } from "openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const client = new OpenAIAPI(config);

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = body?.pixelPrompt;

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Missing pixelPrompt" }), { status: 400 });
  }

  const res = await client.createImage({
    prompt,
    n: 1,
    size: "256x256",
    response_format: "b64_json",
  });

  const b64 = res.data.data[0].b64_json;

  return new Response(JSON.stringify({
    image: `data:image/png;base64,${b64}`,
  }));
}

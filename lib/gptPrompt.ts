export function createLookPrompt(weather: any) {
  return `
You are a Korean fashion & makeup stylist AI.

Today's temperature is ${weather.temp}°C and the weather is "${weather.description}".

Please recommend a suitable fashion style for the day, and return JSON in the following format:

{
  "style": "캐주얼 | 미니멀 | 러블리 | 스트릿 | 페미닌 | 시크 | 클래식 | 아메카지 등",
  "outfit": {
    "outer": "",
    "top": "",
    "bottom": "",
    "shoes": "",
    "accessory": ""
  },
  "makeup": {
    "sunscreen": "",
    "foundation": "",
    "eyeshadow": "",
    "lip": "",
    "shading": "",
    "blusher": "",
    "highlighter": ""
  },
  "pixelPrompt": "an avatar wearing ~~" (1-sentence image prompt for pixel style)
}
Only return valid JSON object.
`.trim();
}

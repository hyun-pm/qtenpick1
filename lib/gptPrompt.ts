export function createLookPrompt(weather: any) {
  const hourlySummary = weather.hourly.map((t: number) => `${t.toFixed(1)}°C`).join(", ");
  return `
다음은 사용자의 날씨 정보입니다.
- 기온: ${weather.temp}도
- 하늘 상태: ${weather.description}
- 시간대별 기온: ${hourlySummary}

위 날씨에 어울리는 스타일 톤(캐주얼/미니멀/러블리/액티브), 아우터, 상의, 하의, 신발, 액세서리와
메이크업(선크림, 파운데이션, 아이섀도우, 립, 쉐딩, 블러셔, 하이라이터) 정보를 아래 JSON 형식으로 주세요:
\`\`\`json
{
  "style": "",
  "outfit": { "outer": "", "top": "", "bottom": "", "shoes": "", "accessory": "" },
  "makeup": { "sunscreen": "", "foundation": "", "eyeshadow": "", "lip": "", "shading": "", "blusher": "", "highlighter": "" },
  "pixelPrompt": ""
}
\`\`\`
주의: JSON 이외의 설명은 하지 말아주세요.
`;
}

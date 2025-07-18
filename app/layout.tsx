import './globals.css';

export const metadata = {
  title: 'QtenPick',
  description: '날씨 기반 픽셀 코디 추천 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head />
      <body>{children}</body>
    </html>
  );
}

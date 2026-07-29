import type { Metadata, Viewport } from 'next';
import './globals.css';
import './labels.css';

export const metadata: Metadata = {
  title: 'TYPE CODE | 64タイプ性格診断',
  description: '人は16タイプだけでは表せない。48問・6軸で導く64タイプ性格診断。'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f7f5ff'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        {children}
        <script src="/free-results.js" defer />
      </body>
    </html>
  );
}
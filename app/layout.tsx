import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Liberty — 多言語AIアシスタント',
  description:
    'LibertyはFOMUSが提供する、自社の知識で多言語AI会話ができる次世代PWA。',
  manifest: '/manifest.json',
  icons: [
    {
      rel: 'icon',
      url: '/icons/icon-192.png',
    },
  ],
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

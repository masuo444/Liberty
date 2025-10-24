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
  openGraph: {
    title: 'Liberty — 多言語AIアシスタント',
    description:
      'LibertyはFOMUSが提供する、自社の知識で多言語AI会話ができる次世代PWA。',
    url: 'https://liberty.fomusglobal.com',
    siteName: 'Liberty',
    images: [
      {
        url: '/ogp.png',
        width: 1200,
        height: 630,
        alt: 'Liberty App Logo',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liberty — 多言語AIアシスタント',
    description:
      'LibertyはFOMUSが提供する、自社の知識で多言語AI会話ができる次世代PWA。',
    images: ['/ogp.png'],
  },
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

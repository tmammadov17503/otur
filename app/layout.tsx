import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://otur-baku.mnazaxan.chatgpt.site'),
  title: 'OTUR — Your table. Your view.',
  description: 'Discover restaurants in Baku and choose exactly where you want to sit.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'OTUR — Your table. Your view.',
    description: 'Know where you’ll sit before you arrive.',
    type: 'website',
    images: [{ url: '/og.png', width: 1664, height: 936, alt: 'OTUR restaurant table preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OTUR — Your table. Your view.',
    description: 'Know where you’ll sit before you arrive.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}

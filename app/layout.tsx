import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Masa Bakı — Choose your table',
  description: 'Explore Baku restaurants, see the room, and reserve the exact table you want.',
  openGraph: {
    title: 'Masa Bakı — Choose your table',
    description: 'See the room, choose your exact table, and reserve your moment in Baku.',
    type: 'website',
    images: [{ url: '/og.png', width: 1675, height: 942, alt: 'Masa Bakı terrace-table preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masa Bakı — Choose your table',
    description: 'See the room, choose your exact table, and reserve your moment in Baku.',
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

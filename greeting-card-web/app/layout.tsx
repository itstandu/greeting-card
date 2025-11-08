import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { FooterWrapper } from '@/components/FooterWrapper';
import { HeaderWrapper } from '@/components/HeaderWrapper';
import { Toaster } from '@/components/ui/sonner';
import { StoreProvider } from '@/lib/store/Provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Greeting Card - Thiệp chúc mừng',
  description: 'Website bán thiệp chúc mừng trực tuyến',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>
          <HeaderWrapper />
          <main className="min-h-screen">{children}</main>
          <FooterWrapper />
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}

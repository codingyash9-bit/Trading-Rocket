import type { Metadata } from 'next';
import { Inter, Montserrat, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { TransitionProvider } from '@/components/TransitionContext';
import TransitionOverlayWrapper from '@/components/TransitionOverlayWrapper';
import FloatingOrb from '@/components/FloatingOrb';
import AuthProvider from '@/components/AuthProvider';
import FlashSignals from '@/components/FlashSignals';
import DemoModeBanner from '@/components/DemoModeBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trading Rocket',
  description: 'Advanced AI-powered stock market intelligence platform for Indian financial markets (NSE/BSE). Real-time analysis, sentiment tracking, and institutional-grade insights.',
  keywords: ['stock market', 'NSE', 'BSE', 'Indian markets', 'AI trading', 'equity analysis', 'FII/DII flows', 'SEBI'],
  authors: [{ name: 'Trading Rocket' }],
  openGraph: {
    title: 'Trading Rocket | AI-Powered Indian Markets Intelligence',
    description: 'Advanced AI-powered stock market intelligence platform for Indian financial markets',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trading Rocket | AI-Powered Indian Markets Intelligence',
    description: 'Advanced AI-powered stock market intelligence platform for Indian financial markets',
  },
  robots: {
    index: false,
    follow: false,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-inter antialiased text-white bg-black antialiased">
        <DemoModeBanner />
        <AuthProvider>
          <TransitionProvider>
            <TransitionOverlayWrapper />
            <FloatingOrb />
            <FlashSignals />
            <div className="relative w-screen h-screen overflow-hidden">
              {children}
            </div>
          </TransitionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Viewport } from 'next';
import { Montserrat, Onest } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const onest = Onest({ variable: '--font-onest', subsets: ['latin', 'cyrillic'] });
const montserrat = Montserrat({ variable: '--font-montserrat', subsets: ['latin'], weight: '900' });

export const viewport: Viewport = { themeColor: '#121212' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${onest.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}

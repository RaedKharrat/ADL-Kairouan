import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from 'next-themes';
import { PublicLayout } from '@/components/layout/PublicLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ADL Tunisie — Alliance pour le Développement Local',
  description:
    "Alliance pour le Développement Local - Tunisie (ADL Tunisie), association soumise au décret-loi n° 2011-88, œuvrant pour une société locale inclusive et durable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <PublicLayout>
              {children}
            </PublicLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

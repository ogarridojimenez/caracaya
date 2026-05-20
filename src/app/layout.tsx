import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { LayoutProviders } from './layout-providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Caraballo - Dulces, Refrescos y Comida',
  description: 'Sistema de pedidos para dulces, refrescos y comida',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caraballo',
  },
};

export const viewport: Viewport = {
  themeColor: '#D97706',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
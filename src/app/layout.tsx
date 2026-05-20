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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://caraballo.vercel.app'),
  title: 'Caraballo - Dulces, Refrescos y Comida',
  description: 'Sistema de pedidos para dulces, refrescos y comida en Cafetería Caraballo. Ordena en línea y recoge sin filas.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caraballo',
  },
  openGraph: {
    title: 'Caraballo - Dulces, Refrescos y Comida',
    description: 'Ordena en línea y recoge sin filas. Dulces, refrescos y comida.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Caraballo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caraballo - Dulces, Refrescos y Comida',
    description: 'Ordena en línea y recoge sin filas.',
  },
};

export const viewport: Viewport = {
  themeColor: '#D97706',
  width: 'device-width',
  initialScale: 1,
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
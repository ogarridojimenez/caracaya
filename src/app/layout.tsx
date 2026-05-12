import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutProviders } from './layout-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Caracaya - Dulces, Refrescos y Comida',
  description: 'Sistema de pedidos para dulces, refrescos y comida',
  manifest: '/manifest.json',
  themeColor: '#D97706',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caracaya',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
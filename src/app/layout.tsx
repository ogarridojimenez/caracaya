import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutProviders } from './layout-providers';

export const metadata: Metadata = {
  title: 'Caracaya - Dulces, Refrescos y Comida',
  description: 'Sistema de pedidos para dulces, refrescos y comida',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caracaya',
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
    <html lang="es">
      <body suppressHydrationWarning>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
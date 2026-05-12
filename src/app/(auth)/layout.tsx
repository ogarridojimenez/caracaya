'use client';

import { LayoutProviders } from '@/app/layout-providers';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <LayoutProviders>{children}</LayoutProviders>;
}
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/hooks';
import { Toaster } from 'react-hot-toast';

interface LayoutProvidersProps {
  children: ReactNode;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function LayoutProviders({ children }: LayoutProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const queryClient = getQueryClient();

  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <div style={{ visibility: 'hidden' }} />
        </QueryClientProvider>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        toastOptions={{
          duration: 4000,
          style: { background: '#374151', color: '#fff', fontSize: '16px', padding: '16px', borderRadius: '8px' },
        }}
      />
    </QueryClientProvider>
  );
}
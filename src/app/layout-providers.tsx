'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/hooks';
import Toaster from 'react-hot-toast';

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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        position="top-center"
        toastOptions={{
          duration: 4000,
          success: {
            style: { background: '#16a34a', color: '#fff', fontSize: '16px', padding: '16px' },
          },
          error: {
            style: { background: '#dc2626', color: '#fff', fontSize: '16px', padding: '16px' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
'use client';

import { Toaster } from 'react-hot-toast';
import type { ToasterProps } from 'react-hot-toast';

export interface ToastProviderProps {
  position?: ToasterProps['position'];
  reverseOrder?: ToasterProps['reverseOrder'];
  gutter?: number;
  containerClassName?: string;
  toastOptions?: ToasterProps['toastOptions'];
}

const defaultOptions: ToasterProps['toastOptions'] = {
  duration: 4000,
  success: {
    style: {
      background: '#22c55e',
      color: '#fff',
      fontWeight: 500,
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#22c55e',
    },
  },
  error: {
    duration: 6000,
    style: {
      background: '#dc2626',
      color: '#fff',
      fontWeight: 500,
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#dc2626',
    },
  },
};

export function ToastProvider({
  position = 'top-right',
  reverseOrder = false,
  gutter = 8,
  containerClassName,
  toastOptions,
}: ToastProviderProps) {
  return (
    <Toaster
      position={position}
      reverseOrder={reverseOrder}
      gutter={gutter}
      containerClassName={containerClassName}
      toastOptions={toastOptions ?? defaultOptions}
    />
  );
}

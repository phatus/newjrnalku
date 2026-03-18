"use client";

import { Toaster as SonnerToaster } from 'sonner';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ToastProviderProps {
  children?: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      <SonnerToaster
        position="top-center"
        richColors
        closeButton
        theme="light"
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50",
          "sm:top-6 sm:left-auto sm:right-4 sm:translate-x-0"
        )}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '1rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      />
      {children}
    </>
  );
}

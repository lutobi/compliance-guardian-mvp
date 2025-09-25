'use client';

import React from 'react';
import { Toaster, toast } from 'sonner';
// Import the toast context hook for consistency
import { useToast } from '@/components/ui/toast-context';

/**
 * Type definition for toast options
 */
type ToastOptions = {
  duration?: number;
  description?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  [key: string]: any;
};

/**
 * Toast notification functions with consistent styling
 */
export const notify = {
  /**
   * Show success notification
   */
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      position: 'top-right',
      duration: 5000,
      ...options,
    }),

  /**
   * Show error notification
   */
  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      position: 'top-right',
      duration: 8000,
      ...options,
    }),

  /**
   * Show warning notification
   */
  warning: (message: string, options?: ToastOptions) =>
    toast.warning(message, {
      position: 'top-right',
      duration: 6000,
      ...options,
    }),

  /**
   * Show info notification
   */
  info: (message: string, options?: ToastOptions) =>
    toast.info(message, {
      position: 'top-right',
      duration: 5000,
      ...options,
    }),
};

/**
 * ToastProvider component to setup Toaster with consistent styling
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme="light"
        duration={5000}
      />
    </>
  );
}

export default ToastProvider;

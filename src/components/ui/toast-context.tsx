'use client';

import * as React from 'react';
import { Toaster, toast } from 'sonner';

type ToastType = {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toast: (props: ToastType) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = (props: ToastType) => {
    if (props.variant === 'destructive') {
      toast.error(props.description, {
        description: props.title,
      });
    } else {
      toast(props.description, {
        description: props.title,
      });
    }
  };

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <Toaster richColors position="bottom-right" />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export { toast };

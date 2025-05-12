import React from 'react';

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  // Nested layout for /system routes
  return <>{children}</>;
}

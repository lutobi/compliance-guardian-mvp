'use client';

import React from 'react';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { CustomerProvider } from '@/lib/workspace/customer-context';
import { AuthProvider } from '@/lib/auth/context';

export default function DemoPage() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <CustomerDashboard />
      </CustomerProvider>
    </AuthProvider>
  );
}

'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { log } from '@/lib/services/errorHandler';
import { toast } from 'sonner';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removed client-side team initialization - now handled in auth context after sign-in

  return (
    <>
      {children}
    </>
  );
}

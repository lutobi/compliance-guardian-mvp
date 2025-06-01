'use client';

import { useQuery } from '@tanstack/react-query';
import { FrameworkService } from '@/services/FrameworkService';
import type { Framework, FrameworkUpdateLog } from '@/types/framework';

export function useFrameworks() {
  return useQuery<Framework[], Error>({
    queryKey: ['frameworks'],
    queryFn: () => FrameworkService.getFrameworks(),
  });
}

export function useFrameworkUpdateLogs(frameworkId: string) {
  return useQuery<FrameworkUpdateLog[], Error>({
    queryKey: ['framework_update_logs', frameworkId],
    queryFn: () => FrameworkService.getUpdateLogs(frameworkId),
    enabled: !!frameworkId,
  });
}

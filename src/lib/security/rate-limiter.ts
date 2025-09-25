/**
 * RATE LIMITING AND USAGE TRACKING SYSTEM
 * 
 * Enterprise-grade rate limiting and usage analytics for multi-tenant SaaS
 * Prevents abuse and enables billing/analytics
 */

import { createWorkspaceScopedClient } from '@/lib/auth/multi-tenant-auth';

// Rate limit configurations by subscription tier
export const RATE_LIMITS = {
  free: {
    api_requests_per_minute: 100,
    api_requests_per_hour: 1000,
    assessments_per_month: 50,
    evidence_uploads_per_day: 10,
    report_exports_per_day: 5
  },
  starter: {
    api_requests_per_minute: 300,
    api_requests_per_hour: 5000,
    assessments_per_month: 200,
    evidence_uploads_per_day: 50,
    report_exports_per_day: 20
  },
  pro: {
    api_requests_per_minute: 1000,
    api_requests_per_hour: 20000,
    assessments_per_month: 1000,
    evidence_uploads_per_day: 200,
    report_exports_per_day: 100
  },
  enterprise: {
    api_requests_per_minute: 5000,
    api_requests_per_hour: 100000,
    assessments_per_month: -1, // unlimited
    evidence_uploads_per_day: -1, // unlimited
    report_exports_per_day: -1 // unlimited
  }
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_time: number;
  limit: number;
}

export interface UsageMetrics {
  workspace_id: string;
  metric_type: string;
  period: 'minute' | 'hour' | 'day' | 'month';
  period_start: string;
  period_end: string;
  count: number;
  limit?: number;
}

/**
 * In-memory rate limiting cache (Redis recommended for production)
 */
class RateLimitCache {
  private cache = new Map<string, { count: number; resetTime: number }>();

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.cache.get(key);

    // If no existing entry or window expired, create new
    if (!existing || now >= existing.resetTime) {
      const resetTime = now + windowMs;
      this.cache.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Increment existing count
    existing.count++;
    this.cache.set(key, existing);
    return existing;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now >= value.resetTime) {
        this.cache.delete(key);
      }
    }
  }
}

const rateLimitCache = new RateLimitCache();

// Cleanup expired entries every minute
setInterval(() => {
  rateLimitCache.cleanup();
}, 60 * 1000);

/**
 * Rate limiter service
 */
export class RateLimiter {
  /**
   * Check if request is within rate limits
   */
  static checkRateLimit(
    workspaceId: string,
    subscriptionTier: keyof typeof RATE_LIMITS,
    limitType: keyof typeof RATE_LIMITS.free,
    identifier?: string // user ID or IP for additional limiting
  ): RateLimitResult {
    const limits = RATE_LIMITS[subscriptionTier];
    const limit = limits[limitType];

    // Enterprise tier unlimited limits
    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        reset_time: -1,
        limit: -1
      };
    }

    // Determine window size based on limit type
    let windowMs: number;
    if (limitType.includes('minute')) {
      windowMs = 60 * 1000;
    } else if (limitType.includes('hour')) {
      windowMs = 60 * 60 * 1000;
    } else if (limitType.includes('day')) {
      windowMs = 24 * 60 * 60 * 1000;
    } else if (limitType.includes('month')) {
      windowMs = 30 * 24 * 60 * 60 * 1000;
    } else {
      windowMs = 60 * 1000; // default to 1 minute
    }

    // Create cache key
    const cacheKey = identifier 
      ? `${workspaceId}:${identifier}:${limitType}`
      : `${workspaceId}:${limitType}`;

    // Check current usage
    const result = rateLimitCache.increment(cacheKey, windowMs);

    return {
      allowed: result.count <= limit,
      remaining: Math.max(0, limit - result.count),
      reset_time: result.resetTime,
      limit
    };
  }

  /**
   * API request rate limiting
   */
  static checkAPIRateLimit(
    workspaceId: string,
    subscriptionTier: keyof typeof RATE_LIMITS,
    userId?: string,
    ipAddress?: string
  ): RateLimitResult {
    // Check per-minute limit first (stricter)
    const minuteCheck = this.checkRateLimit(
      workspaceId, 
      subscriptionTier, 
      'api_requests_per_minute',
      userId || ipAddress
    );

    if (!minuteCheck.allowed) {
      return minuteCheck;
    }

    // Check hourly limit
    return this.checkRateLimit(
      workspaceId,
      subscriptionTier,
      'api_requests_per_hour',
      userId || ipAddress
    );
  }
}

/**
 * Usage tracking service
 */
export class UsageTracker {
  /**
   * Record usage metrics in database
   */
  static async recordUsage(
    workspaceId: string,
    metricType: string,
    period: UsageMetrics['period'] = 'day',
    count: number = 1
  ): Promise<void> {
    try {
      const supabase = createWorkspaceScopedClient(workspaceId);
      
      // Calculate period boundaries
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date;

      switch (period) {
        case 'minute':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
          periodEnd = new Date(periodStart.getTime() + 60 * 1000);
          break;
        case 'hour':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
          periodEnd = new Date(periodStart.getTime() + 60 * 60 * 1000);
          break;
        case 'day':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
          break;
      }

      // Upsert usage metrics
      const { error } = await supabase
        .from('usage_metrics')
        .upsert({
          workspace_id: workspaceId,
          metric_type: metricType,
          period,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          count
        }, {
          onConflict: 'workspace_id,metric_type,period,period_start',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Failed to record usage metrics:', error);
      }

    } catch (error) {
      console.error('Usage tracking error:', error);
      // Don't throw - usage tracking should not break application flow
    }
  }

  /**
   * Get current usage for a workspace
   */
  static async getCurrentUsage(
    workspaceId: string,
    metricType: string,
    period: UsageMetrics['period']
  ): Promise<number> {
    try {
      const supabase = createWorkspaceScopedClient(workspaceId);
      
      // Calculate period start
      const now = new Date();
      let periodStart: Date;

      switch (period) {
        case 'minute':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
          break;
        case 'hour':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
          break;
        case 'day':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          break;
      }

      const { data, error } = await supabase
        .from('usage_metrics')
        .select('count')
        .eq('workspace_id', workspaceId)
        .eq('metric_type', metricType)
        .eq('period', period)
        .eq('period_start', periodStart.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Failed to get current usage:', error);
        return 0;
      }

      return data?.count || 0;

    } catch (error) {
      console.error('Usage retrieval error:', error);
      return 0;
    }
  }

  /**
   * Convenience methods for common metrics
   */
  
  static async recordAPIRequest(workspaceId: string) {
    await Promise.all([
      this.recordUsage(workspaceId, 'api_requests', 'minute'),
      this.recordUsage(workspaceId, 'api_requests', 'hour'),
      this.recordUsage(workspaceId, 'api_requests', 'day')
    ]);
  }

  static async recordAssessmentCreated(workspaceId: string) {
    await this.recordUsage(workspaceId, 'assessments_created', 'month');
  }

  static async recordEvidenceUpload(workspaceId: string) {
    await this.recordUsage(workspaceId, 'evidence_uploads', 'day');
  }

  static async recordReportExport(workspaceId: string) {
    await this.recordUsage(workspaceId, 'report_exports', 'day');
  }
}

/**
 * Middleware helper for rate limiting
 */
export function rateLimitMiddleware(
  workspaceId: string,
  subscriptionTier: keyof typeof RATE_LIMITS,
  userId?: string,
  ipAddress?: string
) {
  const result = RateLimiter.checkAPIRateLimit(workspaceId, subscriptionTier, userId, ipAddress);
  
  // Record the API request for usage tracking
  UsageTracker.recordAPIRequest(workspaceId);
  
  return result;
}

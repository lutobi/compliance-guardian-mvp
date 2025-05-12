export type SubscriptionTier = 'basic' | 'professional' | 'enterprise' | 'custom';

export interface SubscriptionFeatures {
  maxUsers: number;
  maxWorkspaces: number;
  customBranding: boolean;
  customFrameworks: boolean;
  apiAccess: boolean;
  advancedAnalytics: boolean;
  customModules: boolean;
  supportLevel: 'basic' | 'priority' | 'dedicated';
  retentionPeriod: number; // in days
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  tier: SubscriptionTier;
  features: SubscriptionFeatures;
  customFeatures?: Record<string, boolean>;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'suspended' | 'cancelled';
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionFeatures> = {
  basic: {
    maxUsers: 5,
    maxWorkspaces: 1,
    customBranding: false,
    customFrameworks: false,
    apiAccess: false,
    advancedAnalytics: false,
    customModules: false,
    supportLevel: 'basic',
    retentionPeriod: 30
  },
  professional: {
    maxUsers: 20,
    maxWorkspaces: 3,
    customBranding: true,
    customFrameworks: false,
    apiAccess: true,
    advancedAnalytics: true,
    customModules: false,
    supportLevel: 'priority',
    retentionPeriod: 90
  },
  enterprise: {
    maxUsers: 100,
    maxWorkspaces: 10,
    customBranding: true,
    customFrameworks: true,
    apiAccess: true,
    advancedAnalytics: true,
    customModules: true,
    supportLevel: 'dedicated',
    retentionPeriod: 365
  },
  custom: {
    maxUsers: -1, // unlimited
    maxWorkspaces: -1, // unlimited
    customBranding: true,
    customFrameworks: true,
    apiAccess: true,
    advancedAnalytics: true,
    customModules: true,
    supportLevel: 'dedicated',
    retentionPeriod: 730
  }
};

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions?: {
    plan?: string[];
    roles?: string[];
    customLogic?: string;
  };
}

interface CustomerFeatureConfig {
  customerId: string;
  features: Record<string, FeatureFlag>;
  overrides: Record<string, boolean>;
}

export class CustomerFeatureManager {
  private customerId: string;
  private config: CustomerFeatureConfig | null = null;

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  async initialize() {
    const supabase = createClientComponentClient();
    const { data } = await supabase
      .from('customer_features')
      .select('*')
      .eq('customer_id', this.customerId)
      .single();

    this.config = data;
  }

  isFeatureEnabled(featureId: string, context: any = {}): boolean {
    if (!this.config) return false;

    // Check overrides first
    if (this.config.overrides[featureId] !== undefined) {
      return this.config.overrides[featureId];
    }

    const feature = this.config.features[featureId];
    if (!feature) return false;

    // Check base enabled status
    if (!feature.enabled) return false;

    // Check conditions
    if (feature.conditions) {
      // Check plan
      if (feature.conditions.plan && 
          !feature.conditions.plan.includes(context.plan)) {
        return false;
      }

      // Check roles
      if (feature.conditions.roles && 
          !feature.conditions.roles.includes(context.role)) {
        return false;
      }

      // Execute custom logic if present
      if (feature.conditions.customLogic) {
        try {
          return new Function('context', feature.conditions.customLogic)(context);
        } catch (error) {
          console.error('Error in custom logic:', error);
          return false;
        }
      }
    }

    return true;
  }

  async updateFeature(featureId: string, enabled: boolean) {
    if (!this.config) return;

    const supabase = createClientComponentClient();
    await supabase
      .from('customer_features')
      .update({
        overrides: {
          ...this.config.overrides,
          [featureId]: enabled
        }
      })
      .eq('customer_id', this.customerId);

    this.config.overrides[featureId] = enabled;
  }
}

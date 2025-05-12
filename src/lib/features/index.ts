import { FeatureFlag, User, Context } from '@/types/core';

class FeatureManager {
  private static instance: FeatureManager;
  private features: Map<string, FeatureFlag>;

  private constructor() {
    this.features = new Map();
  }

  static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }

  registerFeature(feature: FeatureFlag): void {
    this.features.set(feature.name, feature);
  }

  isEnabled(featureName: string, user: User, context: Context): boolean {
    const feature = this.features.get(featureName);
    if (!feature || !feature.enabled) return false;

    const { conditions } = feature;
    
    // Check role
    if (conditions.roles && 
        !conditions.roles.includes(user.role.name)) {
      return false;
    }

    // Check capabilities
    if (conditions.capabilities && 
        !conditions.capabilities.some(cap => 
          user.role.capabilities.features.includes(cap))) {
      return false;
    }

    // Check environment
    if (conditions.environments && 
        !conditions.environments.includes(context.environment)) {
      return false;
    }

    return true;
  }

  getEnabledFeatures(user: User, context: Context): string[] {
    return Array.from(this.features.keys())
      .filter(name => this.isEnabled(name, user, context));
  }
}

export const featureManager = FeatureManager.getInstance();

// React Hook
export function useFeature(featureName: string) {
  const { user } = useAuth();
  const context = useContext(WorkspaceContext);
  
  return featureManager.isEnabled(featureName, user, context);
}

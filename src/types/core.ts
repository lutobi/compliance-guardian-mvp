export type AccessLevel = 'read' | 'write' | 'admin';

export interface Capability {
  type: 'system' | 'customer';
  access: AccessLevel[];
  features: string[];
}

export interface Context {
  customerId?: string;
  workspace?: string;
  environment: 'development' | 'production';
}

export interface Role {
  id: string;
  name: string;
  capabilities: Capability;
  context: Context;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  metadata: {
    lastLogin: Date;
    preferences: Record<string, any>;
  };
}

export interface Workspace {
  id: string;
  name: string;
  type: 'system' | 'customer';
  context: Context;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions: {
    roles?: string[];
    capabilities?: string[];
    environments?: string[];
  };
}

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ComplianceControl {
  id: string;
  code: string;
  title: string;
  description: string;
  requirements: string[];
  evidence: string[];
  risk_level: 'low' | 'medium' | 'high';
  verification_method: 'automatic' | 'manual' | 'hybrid';
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: ComplianceControl[];
  metadata: {
    industry: string[];
    region: string[];
    type: 'standard' | 'custom';
    author: string;
    lastUpdated: Date;
  };
}

export interface CustomerFrameworkConfig {
  frameworkId: string;
  customerId: string;
  enabled: boolean;
  customControls: Partial<ComplianceControl>[];
  controlOverrides: Record<string, Partial<ComplianceControl>>;
  mappings: Record<string, string[]>; // Map to other frameworks
}

export class FrameworkManager {
  private customerId: string;
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private customerConfigs: Map<string, CustomerFrameworkConfig> = new Map();

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  async initialize() {
    const supabase = createClientComponentClient();

    // Load customer's framework configurations
    const { data: configs } = await supabase
      .from('customer_frameworks')
      .select('*')
      .eq('customer_id', this.customerId);

    if (configs) {
      // Load framework definitions
      const frameworkIds = configs.map(c => c.framework_id);
      const { data: frameworks } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .in('id', frameworkIds);

      if (frameworks) {
        frameworks.forEach(framework => {
          this.frameworks.set(framework.id, framework);
        });

        configs.forEach(config => {
          this.customerConfigs.set(config.framework_id, config);
        });
      }
    }
  }

  getFramework(frameworkId: string): ComplianceFramework | null {
    return this.frameworks.get(frameworkId) || null;
  }

  getCustomerFrameworkConfig(frameworkId: string): CustomerFrameworkConfig | null {
    return this.customerConfigs.get(frameworkId) || null;
  }

  async enableFramework(frameworkId: string) {
    const supabase = createClientComponentClient();
    
    // Check if framework exists
    const framework = this.frameworks.get(frameworkId);
    if (!framework) throw new Error('Framework not found');

    // Create or update customer config
    const config: CustomerFrameworkConfig = {
      frameworkId,
      customerId: this.customerId,
      enabled: true,
      customControls: [],
      controlOverrides: {},
      mappings: {}
    };

    const { data, error } = await supabase
      .from('customer_frameworks')
      .upsert({
        customer_id: this.customerId,
        framework_id: frameworkId,
        ...config
      });

    if (error) throw error;
    this.customerConfigs.set(frameworkId, config);
  }

  async addCustomControl(
    frameworkId: string,
    control: Partial<ComplianceControl>
  ) {
    const config = this.customerConfigs.get(frameworkId);
    if (!config) throw new Error('Framework not enabled for customer');

    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('customer_frameworks')
      .update({
        custom_controls: [...config.customControls, control]
      })
      .eq('customer_id', this.customerId)
      .eq('framework_id', frameworkId);

    if (error) throw error;
    config.customControls.push(control);
  }

  async updateControlOverride(
    frameworkId: string,
    controlId: string,
    override: Partial<ComplianceControl>
  ) {
    const config = this.customerConfigs.get(frameworkId);
    if (!config) throw new Error('Framework not enabled for customer');

    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('customer_frameworks')
      .update({
        control_overrides: {
          ...config.controlOverrides,
          [controlId]: override
        }
      })
      .eq('customer_id', this.customerId)
      .eq('framework_id', frameworkId);

    if (error) throw error;
    config.controlOverrides[controlId] = override;
  }

  getEffectiveControl(frameworkId: string, controlId: string): ComplianceControl | null {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) return null;

    const baseControl = framework.controls.find(c => c.id === controlId);
    if (!baseControl) return null;

    const config = this.customerConfigs.get(frameworkId);
    if (!config) return baseControl;

    const override = config.controlOverrides[controlId];
    if (!override) return baseControl;

    return { ...baseControl, ...override };
  }
}

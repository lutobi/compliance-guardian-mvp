import { supabase } from '@/lib/supabase';

export interface CustomModule {
  id: string;
  name: string;
  description: string;
  type: 'compliance' | 'risk' | 'reporting' | 'integration';
  config: {
    components: Record<string, any>;
    schema: Record<string, any>;
    hooks?: Record<string, Function>;
    api?: Record<string, string>;
  };
  metadata: {
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ModuleInstance {
  id: string;
  moduleId: string;
  customerId: string;
  config: Record<string, any>;
  status: 'active' | 'disabled' | 'error';
  error?: string;
}

export class CustomModuleLoader {
  private customerId: string;
  private loadedModules: Map<string, CustomModule> = new Map();
  private moduleInstances: Map<string, ModuleInstance> = new Map();

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  async initialize() {
    // Use shared supabase client
    // Load customer's module instances
    const { data: instances } = await supabase
      .from('module_instances')
      .select('*')
      .eq('customer_id', this.customerId);

    if (instances) {
      // Load module definitions
      const moduleIds = instances.map(i => i.module_id);
      const { data: modules } = await supabase
        .from('custom_modules')
        .select('*')
        .in('id', moduleIds);

      if (modules) {
        modules.forEach(module => {
          this.loadedModules.set(module.id, module);
        });

        instances.forEach(instance => {
          this.moduleInstances.set(instance.id, instance);
        });
      }
    }
  }

  getModuleComponent(instanceId: string, componentName: string) {
    const instance = this.moduleInstances.get(instanceId);
    if (!instance) return null;

    const module = this.loadedModules.get(instance.moduleId);
    if (!module) return null;

    return module.config.components[componentName];
  }

  async invokeModuleHook(instanceId: string, hookName: string, ...args: any[]) {
    const instance = this.moduleInstances.get(instanceId);
    if (!instance) throw new Error('Module instance not found');

    const module = this.loadedModules.get(instance.moduleId);
    if (!module || !module.config.hooks?.[hookName]) {
      throw new Error(`Hook ${hookName} not found`);
    }

    try {
      return await module.config.hooks[hookName](...args);
    } catch (error) {
      console.error(`Error executing hook ${hookName}:`, error);
      throw error;
    }
  }

  async callModuleApi(instanceId: string, endpoint: string, params: any) {
    const instance = this.moduleInstances.get(instanceId);
    if (!instance) throw new Error('Module instance not found');

    const module = this.loadedModules.get(instance.moduleId);
    if (!module || !module.config.api?.[endpoint]) {
      throw new Error(`API endpoint ${endpoint} not found`);
    }

    const { data, error } = await supabase
      .functions.invoke('custom-module-api', {
        body: {
          instanceId,
          endpoint,
          params
        }
      });

    if (error) throw error;
    return data;
  }
}

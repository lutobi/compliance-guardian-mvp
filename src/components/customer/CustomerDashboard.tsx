'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CustomerFeatureManager } from '@/lib/features/customer-features';
import { CustomModuleLoader } from '@/lib/modules/custom-module-loader';
import { FrameworkManager } from '@/lib/compliance/framework-manager';
import { ComplianceOverview } from '../compliance/ComplianceOverview';
import { RiskAssessment } from '../compliance/RiskAssessment';
import { CustomerSubscription, SUBSCRIPTION_TIERS } from '@/lib/subscription/types';

interface DashboardState {
  subscription: CustomerSubscription | null;
  activeModules: string[];
  frameworks: any[];
  loading: boolean;
}

export function CustomerDashboard() {
  const [state, setState] = useState<DashboardState>({
    subscription: null,
    activeModules: [],
    frameworks: [],
    loading: true
  });

  const [featureManager, setFeatureManager] = useState<CustomerFeatureManager | null>(null);
  const [moduleLoader, setModuleLoader] = useState<CustomModuleLoader | null>(null);
  const [frameworkManager, setFrameworkManager] = useState<FrameworkManager | null>(null);

  useEffect(() => {
    initializeCustomerSystems();
  }, []);

  const initializeCustomerSystems = async () => {
    const supabase = createClientComponentClient();
    
    // Get customer ID from auth context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    // Load subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    // Initialize systems
    const feature = new CustomerFeatureManager(user.id);
    const module = new CustomModuleLoader(user.id);
    const framework = new FrameworkManager(user.id);

    await Promise.all([
      feature.initialize(),
      module.initialize(),
      framework.initialize()
    ]);

    setFeatureManager(feature);
    setModuleLoader(module);
    setFrameworkManager(framework);

    // Load active modules
    const { data: modules } = await supabase
      .from('module_instances')
      .select('*')
      .eq('customer_id', user.id)
      .eq('status', 'active');

    // Load enabled frameworks
    const { data: frameworks } = await supabase
      .from('customer_frameworks')
      .select('*')
      .eq('customer_id', user.id)
      .eq('enabled', true);

    setState({
      subscription,
      activeModules: modules?.map(m => m.id) || [],
      frameworks: frameworks || [],
      loading: false
    });
  };

  if (state.loading) {
    return <div>Loading customer dashboard...</div>;
  }

  const renderSubscriptionBanner = () => {
    const tier = state.subscription?.tier || 'basic';
    const features = SUBSCRIPTION_TIERS[tier];

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-2">
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
        </h2>
        <p className="text-sm opacity-90">
          {features.maxUsers} users • {features.maxWorkspaces} workspaces • 
          {features.supportLevel} support
        </p>
      </div>
    );
  };

  const renderCustomModules = () => {
    if (!moduleLoader || !state.activeModules.length) return null;

    return state.activeModules.map(moduleId => {
      const ModuleComponent = moduleLoader.getModuleComponent(moduleId, 'main');
      return ModuleComponent ? (
        <div key={moduleId} className="mb-6">
          <ModuleComponent />
        </div>
      ) : null;
    });
  };

  const renderFrameworks = () => {
    if (!frameworkManager || !state.frameworks.length) return null;

    return state.frameworks.map(framework => {
      const config = frameworkManager.getCustomerFrameworkConfig(framework.id);
      if (!config?.enabled) return null;

      return (
        <div key={framework.id} className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {framework.name} Compliance
          </h3>
          <ComplianceOverview frameworkId={framework.id} />
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderSubscriptionBanner()}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core Features */}
        {featureManager?.isFeatureEnabled('compliance_overview') && (
          <div className="col-span-full">
            <ComplianceOverview />
          </div>
        )}

        {featureManager?.isFeatureEnabled('risk_assessment') && (
          <div className="col-span-full md:col-span-2">
            <RiskAssessment />
          </div>
        )}

        {/* Custom Modules */}
        {renderCustomModules()}

        {/* Framework-specific Components */}
        {renderFrameworks()}
      </div>
    </div>
  );
}

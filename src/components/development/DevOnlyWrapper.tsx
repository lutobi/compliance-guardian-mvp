import React from 'react';
import { EnvironmentManager } from '@/config/environment';

interface DevOnlyWrapperProps {
  children: React.ReactNode;
  feature?: 'control-analysis' | 'implementation-details' | 'all';
}

export const DevOnlyWrapper: React.FC<DevOnlyWrapperProps> = ({ 
  children, 
  feature = 'all' 
}) => {
  const config = EnvironmentManager.getInstance().getConfig();

  const shouldShow = () => {
    if (!config.showDevelopmentFeatures) return false;

    switch (feature) {
      case 'control-analysis':
        return config.enableControlAnalysis;
      case 'implementation-details':
        return config.showImplementationDetails;
      case 'all':
        return true;
      default:
        return false;
    }
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <div className="dev-only-wrapper border-2 border-yellow-400 p-4 my-4 rounded-lg">
      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm mb-2 inline-block">
        Development Mode Only
      </div>
      {children}
    </div>
  );
};

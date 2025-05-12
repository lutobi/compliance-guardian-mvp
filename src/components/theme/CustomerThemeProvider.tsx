import { createContext, useContext } from 'react';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';

export function CustomerThemeProvider({ children }: { children: React.ReactNode }) {
  const { workspace } = useCustomerWorkspace();
  
  // Generate CSS variables for customer theme
  const themeStyles = workspace?.branding ? {
    '--primary-color': workspace.branding.colors.primary || '#0066cc',
    '--secondary-color': workspace.branding.colors.secondary || '#4d4d4d',
    '--accent-color': workspace.branding.colors.accent || '#00cc99',
    '--background-color': workspace.branding.colors.background || '#ffffff',
    '--text-color': workspace.branding.colors.text || '#1a1a1a',
  } as React.CSSProperties : {};

  return (
    <div style={themeStyles} className="h-full">
      {children}
    </div>
  );
}

import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { CustomerThemeProvider } from '../theme/CustomerThemeProvider';
import { CustomerSidebar } from '../navigation/CustomerSidebar';
import { ComplianceOverview } from '../compliance/ComplianceOverview';
import { RiskAssessment } from '../compliance/RiskAssessment';

export function CustomerShell() {
  const { workspace, loading } = useCustomerWorkspace();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!workspace) {
    return <div>No workspace found</div>;
  }

  return (
    <CustomerThemeProvider>
      <div className="flex h-screen">
        {/* Sidebar with customer branding */}
        <div className="w-64 bg-white border-r">
          <div className="p-4">
            <img 
              src={workspace.branding.logo} 
              alt={workspace.name} 
              className="h-8 w-auto"
            />
          </div>
          <CustomerSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white border-b px-6 py-4">
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
          </header>

          <main className="p-6">
            <div className="grid gap-6">
              {/* Compliance Overview */}
              {workspace.settings.features.enabledModules.includes('compliance') && (
                <ComplianceOverview />
              )}

              {/* Risk Assessment */}
              {workspace.settings.features.enabledModules.includes('risk') && (
                <RiskAssessment />
              )}

              {/* Customer-specific modules */}
              {workspace.settings.features.customizations.map((module) => (
                <DynamicModule key={module.id} {...module} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </CustomerThemeProvider>
  );
}

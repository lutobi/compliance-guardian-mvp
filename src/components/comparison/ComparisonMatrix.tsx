import { FrameworkComparison, ControlMapping } from '@/types/comparison';

interface ComparisonMatrixProps {
  comparison: FrameworkComparison;
}

export function ComparisonMatrix({ comparison }: ComparisonMatrixProps) {
  const { sourceFramework, targetFramework, mappings } = comparison;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Control Mappings</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Coverage:</span>
          <span className="font-medium">{Math.round(comparison.gapAnalysis.coverage * 100)}%</span>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr,100px,1fr] bg-gray-50 p-4">
          <div className="font-medium">{sourceFramework.name}</div>
          <div className="text-center font-medium">Mapping</div>
          <div className="font-medium">{targetFramework.name}</div>
        </div>

        <div className="divide-y">
          {mappings.map((mapping, index) => (
            <div
              key={`${mapping.sourceControlId}-${mapping.targetControlId}`}
              className="grid grid-cols-[1fr,100px,1fr] p-4 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{mapping.sourceControlId}</div>
                <div className="text-sm text-gray-600">{sourceFramework.controls.find(c => c.id === mapping.sourceControlId)?.name}</div>
              </div>
              <div className="flex items-center justify-center">
                <MappingIndicator type={mapping.mappingType} coverage={mapping.coverage} />
              </div>
              <div>
                <div className="font-medium">{mapping.targetControlId}</div>
                <div className="text-sm text-gray-600">{targetFramework.controls.find(c => c.id === mapping.targetControlId)?.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MappingIndicator({ type, coverage }: { type: ControlMapping['mappingType']; coverage: number }) {
  const getColor = () => {
    switch (type) {
      case 'direct':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'related':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full ${getColor()}`} />
      <span className="text-xs text-gray-500 mt-1">{Math.round(coverage * 100)}%</span>
    </div>
  );
}

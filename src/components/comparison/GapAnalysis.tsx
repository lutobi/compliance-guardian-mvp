import { FrameworkComparison } from '@/types/comparison';
import { Control } from '@/types/framework';

interface GapAnalysisProps {
  comparison: FrameworkComparison;
}

export function GapAnalysis({ comparison }: GapAnalysisProps) {
  const { sourceFramework, targetFramework, gapAnalysis } = comparison;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gap Analysis</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <ControlList
          title={`Unique to ${sourceFramework.name}`}
          controls={sourceFramework.controls.filter(c => gapAnalysis.unmappedSourceControls.includes(c.id))}
          emptyMessage={`All controls from ${sourceFramework.name} are mapped`}
        />

        <ControlList
          title={`Unique to ${targetFramework.name}`}
          controls={targetFramework.controls.filter(c => gapAnalysis.unmappedTargetControls.includes(c.id))}
          emptyMessage={`All controls from ${targetFramework.name} are mapped`}
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Implementation Recommendations</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          {gapAnalysis.unmappedSourceControls.length > 0 && (
            <li>
              Consider implementing additional controls from {sourceFramework.name} to improve coverage
            </li>
          )}
          {gapAnalysis.unmappedTargetControls.length > 0 && (
            <li>
              Review unique controls from {targetFramework.name} for potential security improvements
            </li>
          )}
          <li>
            Overall framework compatibility: {Math.round(gapAnalysis.coverage * 100)}%
          </li>
        </ul>
      </div>
    </div>
  );
}

interface ControlListProps {
  title: string;
  controls: Control[];
  emptyMessage: string;
}

function ControlList({ title, controls, emptyMessage }: ControlListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4">
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="p-4">
        {controls.length === 0 ? (
          <p className="text-sm text-gray-600">{emptyMessage}</p>
        ) : (
          <ul className="space-y-4">
            {controls.map((control) => (
              <li key={control.id} className="text-sm">
                <div className="font-medium">{control.id}</div>
                <div className="text-gray-600">{control.name}</div>
                <div className="mt-1 text-gray-500">{control.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

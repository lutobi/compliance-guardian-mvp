import { Framework } from '@/types/framework';
import { VersionInfo } from '@/types/version';
import { Select } from '@/components/ui/select';

interface FrameworkSelectorProps {
  frameworks: Framework[];
  selectedFrameworks: string[];
  onSelect: (frameworkIds: string[]) => void;
  maxSelections?: number;
}

function formatVersion(version: string | VersionInfo): string {
  if (typeof version === 'string') {
    return version;
  }
  return `${version.major}.${version.minor}.${version.patch}`;
}

export function FrameworkSelector({
  frameworks,
  selectedFrameworks,
  onSelect,
  maxSelections = 2
}: FrameworkSelectorProps) {
  const handleFrameworkSelect = (frameworkId: string) => {
    if (selectedFrameworks.includes(frameworkId)) {
      onSelect(selectedFrameworks.filter(id => id !== frameworkId));
    } else if (selectedFrameworks.length < maxSelections) {
      onSelect([...selectedFrameworks, frameworkId]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Frameworks to Compare</h3>
      <p className="text-sm text-gray-600">Choose up to {maxSelections} frameworks</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map((framework) => (
          <div
            key={framework.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedFrameworks.includes(framework.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleFrameworkSelect(framework.id)}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{framework.name}</h4>
              <span className="text-sm text-gray-500">v{formatVersion(framework.version)}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{framework.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

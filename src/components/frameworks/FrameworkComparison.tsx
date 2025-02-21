'use client';

import { useState, useEffect } from 'react';
import { useFrameworkData } from '@/hooks/useFrameworkData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface ComparisonItem {
  id: string;
  name: string;
  description: string;
  coverage: number;
  matchingControls: number;
  totalControls: number;
}

export const FrameworkComparison = () => {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
  const { frameworks, loading } = useFrameworkData();

  const handleFrameworkSelect = (frameworkId: string) => {
    if (selectedFrameworks.includes(frameworkId)) {
      setSelectedFrameworks(prev => prev.filter(id => id !== frameworkId));
    } else if (selectedFrameworks.length < 3) {
      setSelectedFrameworks(prev => [...prev, frameworkId]);
    }
  };

  const compareFrameworks = () => {
    const comparison = selectedFrameworks.map(id => {
      const framework = frameworks.find(f => f.id === id);
      if (!framework) return null;

      const matchingControls = calculateMatchingControls(framework, selectedFrameworks);
      const totalControls = framework.controls?.length || 0;

      return {
        id: framework.id,
        name: framework.name,
        description: framework.description,
        coverage: (matchingControls / totalControls) * 100,
        matchingControls,
        totalControls
      };
    }).filter(Boolean) as ComparisonItem[];

    setComparisonData(comparison);
  };

  const calculateMatchingControls = (framework: any, frameworkIds: string[]) => {
    // Implement control matching logic here
    return framework.controls?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Framework Comparison</h2>
        <p className="text-gray-600">Select up to 3 frameworks to compare</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frameworks.map(framework => (
            <Card 
              key={framework.id}
              className={`p-4 cursor-pointer ${
                selectedFrameworks.includes(framework.id) 
                  ? 'border-primary' 
                  : ''
              }`}
              onClick={() => handleFrameworkSelect(framework.id)}
            >
              <h3 className="font-medium">{framework.name}</h3>
              <p className="text-sm text-gray-600">{framework.version}</p>
            </Card>
          ))}
        </div>

        <Button 
          onClick={compareFrameworks}
          disabled={selectedFrameworks.length < 2}
          className="w-full md:w-auto"
        >
          Compare Frameworks
        </Button>
      </div>

      {comparisonData.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Framework</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Matching Controls</TableHead>
              <TableHead>Total Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.coverage.toFixed(1)}%</TableCell>
                <TableCell>{item.matchingControls}</TableCell>
                <TableCell>{item.totalControls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

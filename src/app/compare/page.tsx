'use client';

import { useState } from 'react';
import { frameworks, frameworkData } from '@/data/frameworks';
import { ComparisonView, FrameworkComparison } from '@/types/comparison';
import { FrameworkSelector } from '@/components/comparison/FrameworkSelector';
import { ComparisonOverview } from '@/components/comparison/ComparisonOverview';
import { ControlsComparison } from '@/components/comparison/ControlsComparison';
import { RequirementsComparison } from '@/components/comparison/RequirementsComparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComparisonService } from '@/services/comparison';

export default function ComparePage() {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<ComparisonView>('overview');
  const [comparison, setComparison] = useState<FrameworkComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFrameworkSelect = (frameworkIds: string[]) => {
    setSelectedFrameworks(frameworkIds);
    setError(null);
    
    if (frameworkIds.length === 2) {
      try {
        const [sourceId, targetId] = frameworkIds;
        const sourceFramework = frameworkData[sourceId];
        const targetFramework = frameworkData[targetId];
        
        if (!sourceFramework?.controls || !targetFramework?.controls) {
          setError('Framework data is incomplete. Please ensure both frameworks have controls defined.');
          setComparison(null);
          return;
        }
        
        const comparisonService = new ComparisonService();
        const result = comparisonService.compareFrameworks(sourceFramework, targetFramework);
        
        setComparison(result);
      } catch (err) {
        setError('An error occurred while comparing frameworks. Please try again.');
        setComparison(null);
      }
    } else {
      setComparison(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-8">
      <h1 className="text-3xl font-bold mb-8">Framework Comparison</h1>

      <div className="space-y-8">
        <FrameworkSelector
          frameworks={frameworks}
          selectedFrameworks={selectedFrameworks}
          onSelect={handleFrameworkSelect}
          maxSelections={2}
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {selectedFrameworks.length < 2 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Select two frameworks to compare their controls and requirements.</p>
          </div>
        ) : comparison ? (
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ComparisonView)}>
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <ComparisonOverview comparison={comparison} />
            </TabsContent>
            <TabsContent value="controls">
              <ControlsComparison comparison={comparison} />
            </TabsContent>
            <TabsContent value="requirements">
              <RequirementsComparison comparison={comparison} />
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </div>
  );
}

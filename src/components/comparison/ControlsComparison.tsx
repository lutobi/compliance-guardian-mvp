'use client';

import { FrameworkComparison } from '@/types/comparison';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useState } from 'react';

interface ControlsComparisonProps {
  comparison: FrameworkComparison;
}

export function ControlsComparison({ comparison }: ControlsComparisonProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex justify-end">
        <Input
          type="search"
          placeholder="Search controls..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Common Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Common Controls</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">{comparison.sourceFramework.name}</h4>
            {comparison.differences.uniqueControls.framework1
              .filter(control => control.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((control) => (
                <div
                  key={control}
                  className="p-2 bg-gray-50 rounded mb-2 border-l-4 border-blue-500"
                >
                  {control}
                </div>
              ))}
          </div>
          <div>
            <h4 className="font-medium mb-2">{comparison.targetFramework.name}</h4>
            {comparison.differences.uniqueControls.framework2
              .filter(control => control.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((control) => (
                <div
                  key={control}
                  className="p-2 bg-gray-50 rounded mb-2 border-l-4 border-green-500"
                >
                  {control}
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Unique Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Unique Controls</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">{comparison.sourceFramework.name} Only</h4>
            {comparison.differences.uniqueControls.framework1
              .filter(control => control.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((control) => (
                <div
                  key={control}
                  className="p-2 bg-gray-50 rounded mb-2 border-l-4 border-red-500"
                >
                  {control}
                </div>
              ))}
          </div>
          <div>
            <h4 className="font-medium mb-2">{comparison.targetFramework.name} Only</h4>
            {comparison.differences.uniqueControls.framework2
              .filter(control => control.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((control) => (
                <div
                  key={control}
                  className="p-2 bg-gray-50 rounded mb-2 border-l-4 border-red-500"
                >
                  {control}
                </div>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

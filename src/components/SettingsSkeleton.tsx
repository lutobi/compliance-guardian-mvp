'use client';

import React from 'react';

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="h-6 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

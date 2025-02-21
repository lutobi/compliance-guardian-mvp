'use client';

import React from 'react';
import { ISOControlSelector } from '@/components/monitoring/ISOControlSelector';

export default function MonitoringSetup() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Compliance Monitoring Setup</h1>
      
      <div className="space-y-8">
        <ISOControlSelector 
          onControlSelect={(selectedControls) => {
            // This will be handled by your monitoring setup logic
            console.log('Selected controls:', selectedControls);
          }} 
        />
      </div>
    </div>
  );
}

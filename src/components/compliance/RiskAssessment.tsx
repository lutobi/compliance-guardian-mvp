'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GlobeAltIcon,
  TruckIcon,
  UserGroupIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface RiskFactor {
  type: string;
  level: 'low' | 'medium' | 'high';
  score: number;
  details: string[];
}

interface RiskAssessment {
  id: string;
  geographic: RiskFactor;
  supplyChain: RiskFactor;
  supplier: RiskFactor;
  product: RiskFactor;
  lastUpdated: string;
}

const riskLevelColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const riskIcons = {
  geographic: GlobeAltIcon,
  supplyChain: TruckIcon,
  supplier: UserGroupIcon,
  product: CubeIcon,
};

export function RiskAssessment() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssessment = async () => {
      const supabase = createClientComponentClient();
      const { data } = await supabase
        .from('risk_assessments')
        .select('*')
        .single();

      if (data) {
        setAssessment(data);
      }
      setLoading(false);
    };

    loadAssessment();
  }, []);

  if (loading) {
    return <div>Loading risk assessment...</div>;
  }

  if (!assessment) {
    return <div>No risk assessment available.</div>;
  }

  const renderRiskFactor = (
    type: string,
    factor: RiskFactor,
    Icon: typeof GlobeAltIcon
  ) => (
    <Card key={type}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <CardTitle className="text-lg">{type} Risk</CardTitle>
        </div>
        <CardDescription>Risk level assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Level</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevelColors[factor.level]}`}>
              {factor.level.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium">Risk Score</span>
            <div className="mt-1 text-2xl font-bold">{factor.score}/100</div>
          </div>
          {factor.details.length > 0 && (
            <div>
              <span className="text-sm font-medium">Key Findings</span>
              <ul className="mt-2 space-y-1">
                {factor.details.map((detail, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Risk Assessment</h2>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(assessment.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {renderRiskFactor('Geographic', assessment.geographic, riskIcons.geographic)}
        {renderRiskFactor('Supply Chain', assessment.supplyChain, riskIcons.supplyChain)}
        {renderRiskFactor('Supplier', assessment.supplier, riskIcons.supplier)}
        {renderRiskFactor('Product', assessment.product, riskIcons.product)}
      </div>
    </div>
  );
}

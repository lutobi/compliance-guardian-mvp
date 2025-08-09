'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface MetricCardProps {
  /**
   * Title of the metric
   */
  title: string;
  
  /**
   * Value of the metric
   */
  value: string | number;
  
  /**
   * Optional change percentage (positive or negative)
   */
  change?: number;
  
  /**
   * Description or sub-text
   */
  description?: string;
  
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Is the card in a loading state
   */
  loading?: boolean;
  
  /**
   * Whether higher values are good (for change indicator)
   */
  higherIsBetter?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  description,
  icon,
  loading = false,
  higherIsBetter = true,
}) => {
  const showChange = change !== undefined;
  
  // Determine if change is positive/negative considering if higher is better
  const isPositiveChange = higherIsBetter ? change && change > 0 : change && change < 0;
  const isNegativeChange = higherIsBetter ? change && change < 0 : change && change > 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-gray-100 p-1.5 text-gray-500">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
            {showChange && (
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
            )}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {showChange && (
              <p className="text-xs flex items-center space-x-1 mt-1.5">
                {isPositiveChange && (
                  <span className="flex items-center text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    {Math.abs(change)}%
                  </span>
                )}
                {isNegativeChange && (
                  <span className="flex items-center text-red-600">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    {Math.abs(change)}%
                  </span>
                )}
                {change === 0 && (
                  <span className="text-gray-500">No change</span>
                )}
                {description && (
                  <span className="text-gray-500 ml-1.5">{description}</span>
                )}
              </p>
            )}
            {!showChange && description && (
              <p className="text-xs text-gray-500 mt-1.5">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardSummaryProps {
  /**
   * Array of metric cards to display
   */
  metrics: MetricCardProps[];
  
  /**
   * Column layout for different screen sizes
   */
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Title for the metrics section
   */
  title?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DashboardSummary component for displaying key metrics on dashboard pages
 */
const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  metrics,
  cols = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  title,
  className = '',
}) => {
  // Generate the grid columns CSS based on the cols prop
  const gridCols = [
    `grid-cols-1`,
    `sm:grid-cols-${cols.sm || 1}`,
    `md:grid-cols-${cols.md || 2}`,
    `lg:grid-cols-${cols.lg || 3}`,
    `xl:grid-cols-${cols.xl || 4}`,
  ].join(' ');
  
  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      )}
      
      <div className={`grid ${gridCols} gap-4`}>
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default DashboardSummary;
export { MetricCard };

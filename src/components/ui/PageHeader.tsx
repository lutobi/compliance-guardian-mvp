'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface PageHeaderProps {
  /**
   * Title of the page
   */
  title: string;
  
  /**
   * Subtitle or description
   */
  description?: string;
  
  /**
   * Primary action button
   */
  primaryAction?: PageHeaderAction;
  
  /**
   * Secondary action buttons
   */
  secondaryActions?: PageHeaderAction[];
  
  /**
   * Optional breadcrumbs component
   */
  breadcrumbs?: React.ReactNode;
  
  /**
   * Whether the header is in loading state
   */
  loading?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional content to render in the header
   */
  children?: React.ReactNode;
}

/**
 * PageHeader component for consistent page headers throughout the application
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  breadcrumbs,
  loading = false,
  className = '',
  children,
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-6 md:px-6 ${className}`}>
      {breadcrumbs && (
        <div className="mb-3">
          {breadcrumbs}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {loading ? (
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              title
            )}
          </h1>
          
          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {loading ? (
                <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                description
              )}
            </p>
          )}
        </div>
        
        {(primaryAction || secondaryActions.length > 0) && (
          <div className="flex items-center space-x-3 self-start md:self-center">
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'outline'}
                size="sm"
                disabled={loading}
              >
                {action.icon && (
                  <span className="mr-2">{action.icon}</span>
                )}
                {action.label}
              </Button>
            ))}
            
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || 'default'}
                size="sm"
                disabled={loading}
              >
                {primaryAction.icon && (
                  <span className="mr-2">{primaryAction.icon}</span>
                )}
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
      
      {children && (
        <div className={`mt-4 ${loading ? 'opacity-50' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

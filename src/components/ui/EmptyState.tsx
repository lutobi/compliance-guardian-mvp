'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  /**
   * Title text for the empty state
   */
  title: string;
  
  /**
   * Description text explaining why this state is empty
   */
  description?: string;
  
  /**
   * Icon/image to display in the empty state
   */
  icon?: React.ReactNode;
  
  /**
   * Label for action button
   */
  actionLabel?: string;
  
  /**
   * Callback for action button click
   */
  onAction?: () => void;
  
  /**
   * Whether to use a compact layout
   */
  compact?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState component for displaying when no data is available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  compact = false,
  className = '',
}) => {
  // Default icon if none is provided
  const defaultIcon = (
    <svg 
      className="w-16 h-16 text-gray-400" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );

  // Compact version
  if (compact) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="flex flex-col items-center p-4 text-center">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 mb-2">
            {icon || (
              <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="flex flex-col items-center p-6 max-w-sm text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          {icon || defaultIcon}
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            className="mt-4"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

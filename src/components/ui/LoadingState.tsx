'use client';

import React from 'react';

interface LoadingStateProps {
  /**
   * Text to display while loading
   */
  text?: string;
  
  /**
   * Size of the spinner - small, medium, or large
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to show a transparent overlay (for overlaying on content)
   */
  overlay?: boolean;
  
  /**
   * Whether to center the loading indicator on the page
   */
  fullPage?: boolean;
}

/**
 * LoadingState component for displaying consistent loading indicators
 * throughout the application
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  text = 'Loading...',
  size = 'medium',
  overlay = false,
  fullPage = false
}) => {
  // Size mapping
  const sizeMap = {
    small: {
      spinner: 'h-4 w-4',
      text: 'text-sm',
      wrapper: 'p-2'
    },
    medium: {
      spinner: 'h-8 w-8',
      text: 'text-base',
      wrapper: 'p-4'
    },
    large: {
      spinner: 'h-12 w-12',
      text: 'text-lg',
      wrapper: 'p-6'
    }
  };
  
  const currentSize = sizeMap[size];
  
  // Base component
  const LoadingContent = () => (
    <div className={`flex flex-col items-center justify-center gap-3 ${currentSize.wrapper}`}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${currentSize.spinner}`}></div>
      </div>
      {text && <p className={`${currentSize.text} text-gray-600`}>{text}</p>}
    </div>
  );
  
  // Full page centered loading
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <LoadingContent />
      </div>
    );
  }
  
  // Overlay loading (for modals, cards, etc.)
  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded z-10">
        <LoadingContent />
      </div>
    );
  }
  
  // Default inline loading
  return <LoadingContent />;
};

export default LoadingState;

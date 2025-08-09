'use client';

import React from 'react';

interface ErrorStateProps {
  /**
   * Title of the error message
   */
  title?: string;
  
  /**
   * Detailed error message
   */
  message?: string;
  
  /**
   * Optional error code
   */
  code?: string;
  
  /**
   * Function to retry the operation that failed
   */
  onRetry?: () => void;
  
  /**
   * Whether to display in a compact form
   */
  compact?: boolean;
  
  /**
   * Whether to center on the page
   */
  fullPage?: boolean;
}

/**
 * ErrorState component for displaying consistent error messages
 * throughout the application
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading data. Please try again later.',
  code,
  onRetry,
  compact = false,
  fullPage = false
}) => {
  // Compact error display (for inline errors)
  if (compact) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            {message && <div className="mt-1 text-sm text-red-700">{message}</div>}
            {onRetry && (
              <div className="mt-2">
                <button 
                  onClick={onRetry}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Full error display
  const ErrorContent = () => (
    <div className="rounded-lg bg-white p-6 shadow-lg border border-red-100 max-w-lg w-full">
      <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-600">
          <p>{message}</p>
          {code && <p className="mt-1 font-mono text-xs text-gray-500">Error code: {code}</p>}
        </div>
        {onRetry && (
          <div className="mt-5">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  // Full page centered error
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ErrorContent />
      </div>
    );
  }
  
  // Default error
  return <ErrorContent />;
};

export default ErrorState;

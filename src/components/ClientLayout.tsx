'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { log } from '@/lib/services/errorHandler';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, profile, isLoading } = useAuth();

  // Initialize team when user is authenticated (with improved error handling and retry logic)
  useEffect(() => {
    let initialized = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds
    
    const initializeTeam = async () => {
      if (isAuthenticated && profile && !isLoading && !initialized) {
        try {
          log('info', 'Attempting team initialization...', { userId: profile.id });
          
          const response = await fetch('/api/team/init', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            initialized = true;
            log('info', 'Team initialization successful');
            toast.success('Team setup complete');
            return true;
          } else {
            log('error', 'Team initialization failed', { 
              status: response.status,
              error: data.error?.message || 'Unknown error'
            });
            
            // Show error toast for client-facing errors
            if (response.status === 400) {
              toast.error(`Setup error: ${data.error?.message || 'Invalid data'}`);
              return true; // Don't retry validation errors
            }
            
            // Only retry for specific error codes that might be temporary
            if (response.status >= 500 && retryCount < MAX_RETRIES) {
              toast.warning('Connection issue. Retrying setup...');
              return false; // Signal for retry
            }
            
            // Show error for non-retryable errors
            if (retryCount >= MAX_RETRIES) {
              toast.error('Could not complete setup. Please try again later.');
            }
            
            return true; // Don't retry for other 4xx errors
          }
        } catch (error: any) {
          log('error', 'Team initialization error', { error: error.message });
          
          if (retryCount >= MAX_RETRIES - 1) {
            toast.error('Connection error. Please check your network.');
          }
          
          return retryCount < MAX_RETRIES; // Retry network errors
        }
      }
      return true; // No need to retry if not authenticated or already initialized
    };
    
    // Implement retry with exponential backoff
    const attemptInitWithRetry = async () => {
      const success = await initializeTeam();
      
      if (!success && retryCount < MAX_RETRIES) {
        retryCount++;
        const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount - 1);
        log('info', `Retrying team initialization`, { 
          attempt: `${retryCount}/${MAX_RETRIES}`,
          delay: backoffDelay
        });
        
        // Use setTimeout for retry with exponential backoff
        setTimeout(attemptInitWithRetry, backoffDelay);
      }
    };
    
    // Only try to initialize if authenticated
    if (isAuthenticated && profile) {
      attemptInitWithRetry();
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      initialized = true; // Prevent further initialization attempts
    };
  }, [isAuthenticated, profile, isLoading]);

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {children}
    </>
  );
}

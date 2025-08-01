// Enhanced unsaved changes hook - comprehensive navigation protection
// Compatible with BrowserRouter (legacy router)

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseUnsavedChangesReturn } from '@/types/transcript';

export const useUnsavedChanges = (hasUnsavedChanges: boolean): UseUnsavedChangesReturn => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const originalPushState = useRef(window.history.pushState);
  const originalReplaceState = useRef(window.history.replaceState);
  const isNavigatingRef = useRef(false);

  // Handle browser beforeunload event (refresh, close tab, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Override history methods to intercept programmatic navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const pushState = (data: any, unused: string, url?: string | URL | null) => {
      if (isNavigatingRef.current) {
        // Allow navigation if we're in the process of navigating (e.g., after save)
        originalPushState.current.call(window.history, data, unused, url);
        return;
      }

      if (url && url !== window.location.pathname + window.location.search) {
        setPendingNavigation(url.toString());
        setIsModalOpen(true);
        return;
      }
      
      originalPushState.current.call(window.history, data, unused, url);
    };

    const replaceState = (data: any, unused: string, url?: string | URL | null) => {
      if (isNavigatingRef.current) {
        originalReplaceState.current.call(window.history, data, unused, url);
        return;
      }

      if (url && url !== window.location.pathname + window.location.search) {
        setPendingNavigation(url.toString());
        setIsModalOpen(true);
        return;
      }
      
      originalReplaceState.current.call(window.history, data, unused, url);
    };

    window.history.pushState = pushState;
    window.history.replaceState = replaceState;

    return () => {
      window.history.pushState = originalPushState.current;
      window.history.replaceState = originalReplaceState.current;
    };
  }, [hasUnsavedChanges]);

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    let isBlocking = false;

    const handlePopState = (e: PopStateEvent) => {
      if (isNavigatingRef.current) return;
      
      if (!isBlocking) {
        isBlocking = true;
        e.preventDefault();
        
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
        
        setIsModalOpen(true);
        setPendingNavigation('back');
        
        // Reset blocking flag after a short delay
        setTimeout(() => {
          isBlocking = false;
        }, 100);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Modal action handlers
  const handleSaveAndGo = useCallback(async (saveFunction: () => Promise<void>) => {
    try {
      await saveFunction();
      
      // Allow navigation and proceed
      isNavigatingRef.current = true;
      
      if (pendingNavigation === 'back') {
        window.history.back();
      } else if (pendingNavigation) {
        navigate(pendingNavigation);
      }
      
      // Reset state
      setIsModalOpen(false);
      setPendingNavigation(null);
      
      // Reset navigation flag after navigation
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  }, [pendingNavigation, navigate]);

  const handleDiscard = useCallback((resetFunction: () => void) => {
    // Reset form to saved state
    resetFunction();
    
    // Allow navigation and proceed
    isNavigatingRef.current = true;
    
    if (pendingNavigation === 'back') {
      window.history.back();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    
    // Reset state
    setIsModalOpen(false);
    setPendingNavigation(null);
    
    // Reset navigation flag after navigation
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [pendingNavigation, navigate]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setPendingNavigation(null);
  }, []);

  // Create a blocker interface for compatibility
  const blocker = {
    state: (hasUnsavedChanges ? 'blocked' : 'unblocked') as 'unblocked' | 'blocked' | 'proceeding',
    proceed: () => {},
    reset: handleCancel
  };

  return {
    hasUnsavedChanges,
    blocker,
    isModalOpen,
    handleSaveAndGo,
    handleDiscard,
    handleCancel
  };
};

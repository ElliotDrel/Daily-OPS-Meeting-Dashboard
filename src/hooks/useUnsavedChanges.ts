// Unsaved changes hook - navigation protection for form data
// Compatible with BrowserRouter (legacy router)

import { useEffect } from 'react';
import { UseUnsavedChangesReturn } from '@/types/transcript';

export const useUnsavedChanges = (hasUnsavedChanges: boolean): UseUnsavedChangesReturn => {
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

  // Create a simple blocker interface for compatibility
  const blocker = {
    state: 'unblocked' as const,
    proceed: () => {},
    reset: () => {}
  };

  return {
    hasUnsavedChanges,
    blocker
  };
};
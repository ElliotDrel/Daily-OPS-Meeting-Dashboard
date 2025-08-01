// Simplified unsaved changes hook - reliable browser navigation protection
// Handles browser refresh/close, provides modal interface for explicit navigation protection

import { useEffect, useState, useCallback } from 'react';
import { UseUnsavedChangesReturn } from '@/types/transcript';

export const useUnsavedChanges = (hasUnsavedChanges: boolean): UseUnsavedChangesReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle browser beforeunload event (refresh, close tab, etc.)
  // This is the only reliable way to intercept browser navigation
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

  // Modal action handlers - simplified without navigation logic
  // Navigation protection for in-app routes should be handled explicitly by components
  const handleSaveAndGo = useCallback(async (saveFunction: () => Promise<void>) => {
    try {
      await saveFunction();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  }, []);

  const handleDiscard = useCallback((resetFunction: () => void) => {
    resetFunction();
    setIsModalOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Utility function for components to show the unsaved changes modal
  const showUnsavedChangesModal = useCallback(() => {
    if (hasUnsavedChanges) {
      setIsModalOpen(true);
      return true;
    }
    return false;
  }, [hasUnsavedChanges]);

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
    handleCancel,
    showUnsavedChangesModal
  };
};

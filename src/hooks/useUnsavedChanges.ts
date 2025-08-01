// Enhanced unsaved changes hook - provides comprehensive navigation protection
// Handles browser refresh/close and in-app navigation with modal confirmation

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseUnsavedChangesReturn } from '@/types/transcript';

export const useUnsavedChanges = (hasUnsavedChanges: boolean): UseUnsavedChangesReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Store the pending navigation action to execute after user choice
  const pendingActionRef = useRef<(() => void) | null>(null);

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

  // Execute the pending action after save/discard
  const executePendingAction = useCallback(() => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setIsModalOpen(false);
      action();
    }
  }, []);

  // Modal action handlers
  const handleSaveAndGo = useCallback(async (saveFunction: () => Promise<void>) => {
    try {
      await saveFunction();
      executePendingAction();
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  }, [executePendingAction]);

  const handleDiscard = useCallback((resetFunction: () => void) => {
    resetFunction();
    executePendingAction();
  }, [executePendingAction]);

  const handleCancel = useCallback(() => {
    pendingActionRef.current = null;
    setIsModalOpen(false);
  }, []);

  // Navigation protection functions
  const protectNavigation = useCallback((action: () => void) => {
    if (hasUnsavedChanges) {
      pendingActionRef.current = action;
      setIsModalOpen(true);
      return true; // Navigation was blocked
    } else {
      action(); // No unsaved changes, proceed immediately
      return false; // Navigation was not blocked
    }
  }, [hasUnsavedChanges]);

  const protectRouteNavigation = useCallback((path: string) => {
    return protectNavigation(() => navigate(path));
  }, [navigate, protectNavigation]);

  const protectDateChange = useCallback((newDate: Date, changeHandler: (date: Date) => void) => {
    return protectNavigation(() => changeHandler(newDate));
  }, [protectNavigation]);

  const protectGenericAction = useCallback((action: () => void) => {
    return protectNavigation(action);
  }, [protectNavigation]);

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
    showUnsavedChangesModal,
    protectRouteNavigation,
    protectDateChange,
    protectGenericAction
  };
};

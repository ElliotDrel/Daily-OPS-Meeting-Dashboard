// Unsaved Changes Navigation Protection Modal
// Appears when user tries to navigate away with unsaved changes

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSaveAndGo: () => Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
  validation: {
    isFormValid: boolean;
    transcript: {
      error?: string;
    };
  };
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSaveAndGo,
  onDiscard,
  onCancel,
  validation
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveAndGo = async () => {
    if (!validation.isFormValid) {
      setSaveError(validation.transcript.error || 'Form validation failed');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    
    try {
      await onSaveAndGo();
    } catch (error) {
      setSaveError('Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setIsSaving(false);
    setSaveError(null);
    onDiscard();
  };

  const handleCancel = () => {
    setIsSaving(false);
    setSaveError(null);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>You have unsaved changes</span>
          </DialogTitle>
          <DialogDescription>
            Your changes haven't been saved yet. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Save Error Display */}
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Save & Go */}
            <Button
              onClick={handleSaveAndGo}
              disabled={isSaving}
              className={cn(
                "w-full justify-start",
                !validation.isFormValid && "opacity-60"
              )}
              variant="default"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-3" />
                  Save & Continue
                  {!validation.isFormValid && (
                    <span className="ml-2 text-xs opacity-75">
                      (Validation required)
                    </span>
                  )}
                </>
              )}
            </Button>

            {/* Discard */}
            <Button
              onClick={handleDiscard}
              disabled={isSaving}
              variant="destructive"
              className="w-full justify-start"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Discard Changes
            </Button>

            {/* Cancel */}
            <Button
              onClick={handleCancel}
              disabled={isSaving}
              variant="outline"
              className="w-full justify-start"
            >
              <X className="w-4 h-4 mr-3" />
              Cancel
            </Button>
          </div>

          {/* Validation Help */}
          {!validation.isFormValid && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-700">
                <strong>Note:</strong> Your transcript needs at least 1,000 characters to save. 
                Fix this issue first or discard your changes.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
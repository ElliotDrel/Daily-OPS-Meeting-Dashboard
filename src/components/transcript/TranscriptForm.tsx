// Transcript form component - handles transcript and additional notes input with validation
// Following patterns from existing form components and BulletTextArea

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, AlertCircle, CheckCircle, Save, AlertTriangle, Trash2, Info } from 'lucide-react';
import { TranscriptFormProps } from '@/types/transcript';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { containsTranscriptScript } from '@/utils/transcriptUtils';

export const TranscriptForm: React.FC<TranscriptFormProps> = ({
  formData,
  validation,
  isLoading,
  error,
  isFormDirty,
  saveStatus,
  lastSavedAt,
  onInputChange,
  onSave,
  onDelete,
  canSave,
  canDelete,
  isDeleting
}) => {
  // Helper function to get status badge content - always shows sync status
  const getStatusBadge = () => {
    if (saveStatus === 'saving') {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Saving...
        </Badge>
      );
    }
    
    if (saveStatus === 'error') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Save failed
        </Badge>
      );
    }
    
    // Always show sync status based on form state
    if (isFormDirty) {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Unsaved changes
        </Badge>
      );
    }
    
    // Show synced status when data exists and matches database
    if (lastSavedAt || (formData.transcript && !isFormDirty)) {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Synced
        </Badge>
      );
    }
    
    // No data state
    return (
      <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200">
        <Save className="w-3 h-3 mr-1" />
        No data
      </Badge>
    );
  };

  // Helper function to get last saved text
  const getLastSavedText = () => {
    if (!lastSavedAt) return null;
    return `Last saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}`;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-muted-foreground">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load transcript data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold">Daily Transcript</h2>
          {getStatusBadge()}
          {/* Delete Button - Small and to the right of status badge */}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      <span className="text-xs">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 mr-1" />
                      <span className="text-xs">Delete All</span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Delete Transcript Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Are you sure you want to delete this transcript? This action cannot be undone.
                    </p>
                    <div className="bg-destructive/10 border-l-4 border-destructive p-3 rounded">
                      <p className="font-medium text-destructive mb-1">⚠️ Warning:</p>
                      <p className="text-sm">
                        Once deleted, this transcript will be <strong>permanently removed</strong> from the database. 
                        There is no way to recover it.
                      </p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                      <p className="font-medium text-blue-800 mb-1">💡 Alternative:</p>
                      <p className="text-sm text-blue-700">
                        Consider <strong>editing</strong> the transcript instead if you just need to make changes. 
                        You can modify the content and save your updates.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {getLastSavedText()}
        </div>
      </div>
      {/* Transcript Input */}
      <div className="space-y-3">
        <div>
          <label htmlFor="transcript" className="text-sm font-medium text-foreground">
            Meeting Transcript *
          </label>
        </div>
        
        <div className="relative">
          <Textarea
            id="transcript"
            placeholder="Paste your meeting transcript here..."
            value={formData.transcript}
            onChange={(e) => onInputChange('transcript', e.target.value)}
            className={cn(
              "min-h-[300px] resize-none transition-colors",
              !validation.transcript.isValid && formData.transcript.length > 0 && "border-destructive focus-visible:ring-destructive",
              // Always show sync status highlighting
              !isFormDirty && (lastSavedAt || formData.transcript) && "border-green-200 bg-green-50", // Synced state
              isFormDirty && "border-orange-200 bg-orange-50" // Unsaved changes
            )}
            disabled={isLoading}
          />
        </div>
        
        {!validation.transcript.isValid && formData.transcript.length > 0 && (
          <p className="text-sm text-destructive">
            {validation.transcript.error}
          </p>
        )}
      </div>

      {/* Additional Notes Input */}
      <div className="space-y-3">
        <label htmlFor="additional-notes" className="text-sm font-medium text-foreground">
          Additional Notes
          <span className="text-muted-foreground font-normal ml-1">(optional)</span>
        </label>
        
        <Textarea
          id="additional-notes"
          placeholder="Add any additional notes, context, or action items (optional)..."
          value={formData.additional_notes}
          onChange={(e) => onInputChange('additional_notes', e.target.value)}
          className={cn(
            "min-h-[150px] resize-none transition-colors",
            // Always show sync status highlighting
            !isFormDirty && (lastSavedAt || formData.additional_notes) && "border-green-200 bg-green-50", // Synced state
            isFormDirty && "border-orange-200 bg-orange-50" // Unsaved changes
          )}
          disabled={isLoading}
        />
        
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-3">
        <Button
          onClick={onSave}
          disabled={!canSave}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        
        {!validation.isFormValid && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please enter transcript content to save
          </p>
        )}
      </div>
    </div>
  );
};

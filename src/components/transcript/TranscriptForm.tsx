// Transcript form component - handles transcript and additional notes input with validation
// Following patterns from existing form components and BulletTextArea

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { TranscriptFormProps } from '@/types/transcript';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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
  canSave
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
        </div>
        <div className="text-sm text-muted-foreground">
          {getLastSavedText()}
        </div>
      </div>
      {/* Transcript Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="transcript" className="text-sm font-medium text-foreground">
            Meeting Transcript *
          </label>
          <span className={cn(
            "text-xs",
            validation.transcript.isValid ? "text-muted-foreground" : "text-destructive"
          )}>
            {formData.transcript.length} / 1,000 minimum
          </span>
        </div>
        
        <Textarea
          id="transcript"
          placeholder="Paste your meeting transcript here (minimum 1,000 characters)..."
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
        
        {!validation.transcript.isValid && formData.transcript.length > 0 && (
          <p className="text-sm text-destructive">
            {validation.transcript.error}
          </p>
        )}
        
        {formData.transcript.length > 0 && formData.transcript.length < 1000 && (
          <p className="text-sm text-muted-foreground">
            Need {1000 - formData.transcript.length} more characters to save
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

      {/* Save Button */}
      <div className="pt-4">
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
            Please enter at least 1,000 characters in the transcript to save
          </p>
        )}
      </div>
    </div>
  );
};
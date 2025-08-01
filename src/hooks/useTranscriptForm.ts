// Transcript form hook - form state management, validation, and save operations
// Following patterns from useDataCollection.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TranscriptService } from '@/services/transcriptService';
import { 
  TranscriptFormData, 
  TranscriptValidation, 
  DailyTranscript,
  UseTranscriptFormReturn
} from '@/types/transcript';

export const useTranscriptForm = (
  transcript: DailyTranscript | null, 
  date: string
): UseTranscriptFormReturn => {
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState<TranscriptFormData>({
    transcript: '',
    additional_notes: ''
  });
  
  // Track original data to detect changes
  const [initialData, setInitialData] = useState<TranscriptFormData>({
    transcript: '',
    additional_notes: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);

  // Update form when transcript data changes
  useEffect(() => {
    const newData = {
      transcript: transcript?.transcript || '',
      additional_notes: transcript?.additional_notes || ''
    };
    setFormData(newData);
    setInitialData(newData);
    
    // Reset save status when switching dates - only keep 'saved' status if data exists
    if (transcript) {
      setSaveStatus('saved');
      setLastSavedAt(new Date(transcript.updated_at || transcript.created_at));
    } else {
      setSaveStatus('idle');
      setLastSavedAt(null);
    }
  }, [transcript]);

  // Validation logic
  const validation = useMemo((): TranscriptValidation => {
    const transcriptValid = formData.transcript.trim().length > 0;
    
    return {
      transcript: {
        isValid: transcriptValid,
        error: transcriptValid ? undefined : 'Transcript cannot be empty'
      },
      isFormValid: transcriptValid
    };
  }, [formData.transcript]);

  // Check if form has unsaved changes
  const isFormDirty = useMemo(() => {
    return formData.transcript !== initialData.transcript ||
           formData.additional_notes !== initialData.additional_notes;
  }, [formData, initialData]);

  // Update save status when form becomes dirty
  useEffect(() => {
    if (isFormDirty && saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  }, [isFormDirty, saveStatus]);

  // Clear validation error when transcript becomes valid
  useEffect(() => {
    if (validation.isFormValid && showValidationError) {
      setShowValidationError(false);
    }
  }, [validation.isFormValid, showValidationError]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof TranscriptFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Save mutation following existing patterns
  const saveTranscriptMutation = useMutation({
    mutationFn: async () => {
      return await TranscriptService.upsertTranscript(date, {
        transcript: formData.transcript,
        additional_notes: formData.additional_notes || undefined
      });
    },
    onSuccess: (savedTranscript) => {
      // Update form state to reflect saved data
      const newData = {
        transcript: savedTranscript.transcript,
        additional_notes: savedTranscript.additional_notes || ''
      };
      setInitialData(newData);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transcript', date] });
      queryClient.invalidateQueries({ queryKey: ['transcript-dates'] });
      
      toast.success('Transcript saved successfully');
    },
    onError: (error) => {
      console.error('Save error:', error);
      setSaveStatus('error');
      toast.error('Failed to save transcript. Please try again.');
    }
  });

  // Delete mutation
  const deleteTranscriptMutation = useMutation({
    mutationFn: async () => {
      await TranscriptService.deleteTranscript(date);
    },
    onSuccess: () => {
      // Reset form state to empty
      const emptyData = {
        transcript: '',
        additional_notes: ''
      };
      setFormData(emptyData);
      setInitialData(emptyData);
      setSaveStatus('idle');
      setLastSavedAt(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transcript', date] });
      queryClient.invalidateQueries({ queryKey: ['transcript-dates'] });
      
      toast.success('Transcript deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete transcript. Please try again.');
    }
  });

  // Handle save operation
  const handleSave = useCallback(async () => {
    if (!validation.isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await saveTranscriptMutation.mutateAsync();
    } catch (error) {
      // Error already handled in mutation onError
    } finally {
      setIsSaving(false);
    }
  }, [validation.isFormValid, saveTranscriptMutation]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  // Handle delete operation
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteTranscriptMutation.mutateAsync();
    } catch (error) {
      // Error already handled in mutation onError
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTranscriptMutation]);

  // Determine if delete is available - only if transcript exists
  const canDelete = useMemo(() => {
    return Boolean(transcript && !isDeleting);
  }, [transcript, isDeleting]);

  return {
    formData,
    validation,
    isFormDirty,
    isSaving,
    saveStatus,
    lastSavedAt,
    showValidationError,
    handleInputChange,
    handleSave,
    resetForm,
    handleDelete,
    canDelete,
    isDeleting
  };
};

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
  UseTranscriptFormReturn,
  MINIMUM_TRANSCRIPT_LENGTH 
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Update form when transcript data changes
  useEffect(() => {
    const newData = {
      transcript: transcript?.transcript || '',
      additional_notes: transcript?.additional_notes || ''
    };
    setFormData(newData);
    setInitialData(newData);
  }, [transcript]);

  // Validation logic
  const validation = useMemo((): TranscriptValidation => {
    const transcriptValid = formData.transcript.length >= MINIMUM_TRANSCRIPT_LENGTH;
    
    return {
      transcript: {
        isValid: transcriptValid,
        error: transcriptValid ? undefined : `Transcript must be at least ${MINIMUM_TRANSCRIPT_LENGTH} characters (currently ${formData.transcript.length})`
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

  // Handle save operation
  const handleSave = useCallback(async () => {
    if (!validation.isFormValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

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

  return {
    formData,
    validation,
    isFormDirty,
    isSaving,
    saveStatus,
    lastSavedAt,
    handleInputChange,
    handleSave,
    resetForm
  };
};
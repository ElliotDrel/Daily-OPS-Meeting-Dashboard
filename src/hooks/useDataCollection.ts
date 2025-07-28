// Data collection hook - core form logic and state management
// Handles form state, validation, conditional logic, and persistence

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  getQuestionsForPillar,
  getVisibleQuestions,
  saveResponse, 
  getResponse, 
  hasResponse,
  formatResponseForForm 
} from '@/services/dataCollectionService';
import { 
  PillarQuestion, 
  FormData, 
  ValidationError, 
  FormSubmissionState,
  DataCollectionButtonState,
  UseDataCollectionReturn 
} from '@/types/dataCollection';

export const useDataCollection = (
  pillar: string, 
  selectedDate: string
): UseDataCollectionReturn => {
  const queryClient = useQueryClient();
  
  // Core state
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submissionState, setSubmissionState] = useState<FormSubmissionState>('idle');

  // Load questions for this pillar
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['pillar-questions', pillar],
    queryFn: () => getQuestionsForPillar(pillar),
    staleTime: 5 * 60 * 1000, // Cache questions for 5 minutes
  });

  // Load existing response
  const { data: existingResponse, isLoading: responseLoading } = useQuery({
    queryKey: ['pillar-response', pillar, selectedDate],
    queryFn: () => getResponse(pillar, selectedDate),
    enabled: !!pillar && !!selectedDate,
  });

  // Compute derived state
  const isLoading = questionsLoading || responseLoading;
  const hasExistingData = !!existingResponse;

  // Get visible questions based on current form data
  const visibleQuestions = useMemo(() => {
    return getVisibleQuestions(questions, formData);
  }, [questions, formData]);

  // Determine button state
  const buttonState = useMemo((): DataCollectionButtonState => {
    if (isLoading) return 'loading';
    if (questions.length === 0) return 'no-questions';
    if (hasExistingData) return 'edit';
    return 'collect';
  }, [isLoading, questions.length, hasExistingData]);

  // Initialize form data when existing response loads
  useEffect(() => {
    if (existingResponse) {
      setFormData(formatResponseForForm(existingResponse));
      setErrors([]);
    } else {
      setFormData({});
      setErrors([]);
    }
  }, [existingResponse]);

  // Load existing data function for manual refresh
  const loadExistingData = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['pillar-response', pillar, selectedDate] });
  }, [queryClient, pillar, selectedDate]);

  // Validate form data
  const validateForm = useCallback((): ValidationError[] => {
    const newErrors: ValidationError[] = [];
    
    visibleQuestions.forEach(question => {
      const value = formData[question.id];
      
      // Check required fields
      if (question.required) {
        if (value === undefined || value === null || value === '') {
          newErrors.push({
            field: question.id,
            message: `${question.text} is required`
          });
        }
        
        // For multiselect, check if array is empty
        if (question.type === 'multiselect' && Array.isArray(value) && value.length === 0) {
          newErrors.push({
            field: question.id,
            message: `${question.text} is required`
          });
        }
      }
      
      // Type-specific validation
      if (value !== undefined && value !== null && value !== '') {
        switch (question.type) {
          case 'number':
            if (isNaN(Number(value))) {
              newErrors.push({
                field: question.id,
                message: `${question.text} must be a valid number`
              });
            } else if (Number(value) < 0) {
              newErrors.push({
                field: question.id,
                message: `${question.text} must be a positive number`
              });
            }
            break;
            
          case 'text':
          case 'textarea':
            if (typeof value !== 'string') {
              newErrors.push({
                field: question.id,
                message: `${question.text} must be text`
              });
            }
            break;
            
          case 'multiselect':
            if (!Array.isArray(value)) {
              newErrors.push({
                field: question.id,
                message: `${question.text} must be a selection`
              });
            }
            break;
        }
      }
    });
    
    return newErrors;
  }, [visibleQuestions, formData]);

  // Set form field value
  const setValue = useCallback((questionId: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear field-specific errors when user types
    setErrors(prev => prev.filter(error => error.field !== questionId));
  }, []);

  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async (responseData: Record<string, string | number | boolean | string[]>) => {
      return await saveResponse(pillar, selectedDate, responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pillar-response', pillar, selectedDate] });
      setSubmissionState('success');
      setErrors([]);
      
      // Auto-reset submission state after success
      setTimeout(() => {
        setSubmissionState('idle');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error submitting form:', error);
      setErrors([{ 
        field: 'general', 
        message: 'Failed to save data. Please try again.' 
      }]);
      setSubmissionState('error');
    }
  });

  // Submit form
  const submitForm = useCallback(async () => {
    setSubmissionState('submitting');
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSubmissionState('error');
      return;
    }
    
    // Prepare response data - only include visible questions
    const responseData: Record<string, string | number | boolean | string[]> = {};
    visibleQuestions.forEach(question => {
      const value = formData[question.id];
      if (value !== undefined) {
        responseData[question.id] = value;
      }
    });
    
    // Submit using mutation
    saveResponseMutation.mutate(responseData);
  }, [formData, visibleQuestions, validateForm, saveResponseMutation]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({});
    setErrors([]);
    setSubmissionState('idle');
  }, []);

  return {
    questions,
    visibleQuestions,
    formData,
    errors,
    isLoading,
    hasExistingData,
    submissionState,
    buttonState,
    setValue,
    submitForm,
    resetForm,
    loadExistingData
  };
};
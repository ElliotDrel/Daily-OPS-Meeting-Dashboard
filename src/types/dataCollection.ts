// Data collection types and interfaces
// This file defines all TypeScript interfaces for the data collection system

export interface PillarQuestion {
  id: string;
  pillar: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'multiselect';
  required: boolean;
  options?: string[];
  order: number;
  conditional?: {
    dependsOn: string;
    showWhen: string | number | boolean | string[];
  };
}

export interface PillarResponse {
  id: string;
  userId: string; // For future user tracking
  pillar: string;
  responseDate: string; // ISO date string (YYYY-MM-DD)
  responses: Record<string, string | number | boolean | string[]>; // Question ID -> Answer value
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FormData {
  [questionId: string]: string | number | boolean | string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormFieldProps {
  question: PillarQuestion;
  value: string | number | boolean | string[];
  onChange: (value: string | number | boolean | string[]) => void;
  error?: string;
}

export interface ConditionalField {
  questionId: string;
  dependsOn: string;
  showWhen: string | number | boolean | string[];
  isVisible: boolean;
}

// Form submission states
export type FormSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// Button states for data collection
export type DataCollectionButtonState = 'collect' | 'edit' | 'no-questions' | 'loading';

// Hook return types
export interface UseDataCollectionReturn {
  questions: PillarQuestion[];
  visibleQuestions: PillarQuestion[];
  formData: FormData;
  errors: ValidationError[];
  isLoading: boolean;
  hasExistingData: boolean;
  submissionState: FormSubmissionState;
  buttonState: DataCollectionButtonState;
  setValue: (questionId: string, value: string | number | boolean | string[]) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  loadExistingData: () => Promise<void>;
}

// Response storage format (for localStorage/file system)
export interface StoredResponse {
  [pillar: string]: {
    [date: string]: PillarResponse;
  };
}

// Form validation schema types
export interface FormValidationSchema {
  [questionId: string]: {
    required: boolean;
    type: PillarQuestion['type'];
    validator?: (value: string | number | boolean | string[]) => boolean;
    errorMessage?: string;
  };
}

// Modal props
export interface DataCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar: string;
  selectedDate: string;
  onSuccess?: () => void;
}

// Button props
export interface DataCollectionButtonProps {
  pillar: string;
  selectedDate: string;
  className?: string;
}
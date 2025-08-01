// Daily Transcript Storage types and interfaces
// This file defines all TypeScript interfaces for the transcript storage system

// Database entity interface matching the database schema
export interface DailyTranscript {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  transcript: string;
  additional_notes: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Data transfer objects for API operations
export interface CreateTranscriptData {
  date: string; // ISO date string (YYYY-MM-DD)
  transcript: string;
  additional_notes?: string;
}

export interface UpdateTranscriptData {
  transcript: string;
  additional_notes?: string;
}

// Form-specific types
export interface TranscriptFormData {
  transcript: string;
  additional_notes: string;
}

export interface TranscriptValidation {
  transcript: {
    isValid: boolean;
    error?: string;
  };
  isFormValid: boolean;
}

// Calendar status types
export type CalendarStatus = 'saved' | 'empty' | 'future';

export interface CalendarDateStatus {
  date: string; // ISO date string (YYYY-MM-DD)
  status: CalendarStatus;
  hasTranscript: boolean;
}

// Form submission states (following existing pattern)
export type TranscriptSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// Hook return types
export interface UseTranscriptFormReturn {
  formData: TranscriptFormData;
  validation: TranscriptValidation;
  isFormDirty: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  handleInputChange: (field: keyof TranscriptFormData, value: string) => void;
  handleSave: () => Promise<void>;
  resetForm: () => void;
  handleDelete: () => Promise<void>;
  canDelete: boolean;
  isDeleting: boolean;
}

export interface UseTranscriptDataReturn {
  transcript: DailyTranscript | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseCalendarStatusReturn {
  getDateStatus: (date: Date) => CalendarStatus;
  getCalendarDateStatus: (date: Date) => CalendarDateStatus;
  isLoading: boolean;
}

export interface UseUnsavedChangesReturn {
  hasUnsavedChanges: boolean;
  blocker: {
    state: 'unblocked' | 'blocked' | 'proceeding';
    proceed: () => void;
    reset: () => void;
  };
  isModalOpen: boolean;
  handleSaveAndGo: (saveFunction: () => Promise<void>) => Promise<void>;
  handleDiscard: (resetFunction: () => void) => void;
  handleCancel: () => void;
  showUnsavedChangesModal: () => boolean;
}

// Component props interfaces
export interface TranscriptFormProps {
  formData: TranscriptFormData;
  validation: TranscriptValidation;
  isLoading: boolean;
  error: Error | null;
  isFormDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  onInputChange: (field: keyof TranscriptFormData, value: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  canSave: boolean;
  canDelete: boolean;
  isDeleting: boolean;
}

export interface TranscriptCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export interface TranscriptDateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export interface TranscriptLayoutProps {
  title: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  calendar: React.ReactNode;
  dateSelector: React.ReactNode;
  children: React.ReactNode;
}

// Service layer types
export interface TranscriptServiceError extends Error {
  code?: string;
  details?: string;
}

// Constants
export const MINIMUM_TRANSCRIPT_LENGTH = 1000;

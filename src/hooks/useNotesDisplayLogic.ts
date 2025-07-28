import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { MeetingNote } from './usePillarDataOptimized';

/**
 * Centralized business logic for notes display decisions
 * Fixes all the identified issues in one place:
 * - Empty content validation
 * - Consistent date handling  
 * - Race condition handling
 * - Proper loading states
 */

interface NotesDisplayState {
  // What should be displayed
  shouldShowYesterday: boolean;
  shouldShowLastRecorded: boolean;
  
  // Processed display data
  yesterdayDisplay: {
    note: MeetingNote | null;
    hasContent: boolean;
    dateLabel: string;
  };
  
  lastRecordedDisplay: {
    note: MeetingNote | null;
    hasContent: boolean;
    dateLabel: string;
  } | null;
  
  // Loading and error states
  isLoading: boolean;
  isReady: boolean; // All required data loaded
  error: string | null;
}

interface UseNotesDisplayLogicProps {
  yesterdayMeetingNote?: MeetingNote | null;
  lastRecordedNote?: MeetingNote | null;
  selectedDate: string;
  isLoading?: boolean;
  isYesterdayLoading?: boolean;
  isLastRecordedLoading?: boolean;
}

/**
 * Validates if a note has meaningful content
 * Fixes Issue #1: Empty string key_points bug
 */
function hasValidContent(note: MeetingNote | null | undefined): boolean {
  if (!note) return false;
  
  // Check if key_points exists and has non-whitespace content
  const keyPoints = note.key_points?.trim();
  if (!keyPoints) return false;
  
  // Check if keyPoints array has meaningful content  
  const keyPointsArray = note.keyPoints;
  if (keyPointsArray && keyPointsArray.length > 0) {
    return keyPointsArray.some(point => point.trim().length > 0);
  }
  
  // Fallback to key_points string check
  return keyPoints.length > 0;
}

/**
 * Creates consistent date labels using same date parsing approach
 * Fixes Issue #2: Timezone inconsistency
 */
function createDateLabel(dateString: string): string {
  try {
    // Use parseISO consistently (same as in usePillarDataOptimized)
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString; // Fallback to original string
  }
}

/**
 * Validates that lastRecordedNote is actually older than yesterday
 * Fixes Issue #5: Missing date validation
 */
function isValidLastRecordedDate(
  lastRecordedNote: MeetingNote | null,
  yesterdayDate: string
): boolean {
  if (!lastRecordedNote) return false;
  
  try {
    const lastRecordedDate = parseISO(lastRecordedNote.note_date);
    const yesterday = parseISO(yesterdayDate);
    return lastRecordedDate < yesterday;
  } catch {
    return false;
  }
}

export const useNotesDisplayLogic = ({
  yesterdayMeetingNote,
  lastRecordedNote,
  selectedDate,
  isLoading = false,
  isYesterdayLoading = false,
  isLastRecordedLoading = false
}: UseNotesDisplayLogicProps): NotesDisplayState => {
  
  return useMemo(() => {
    // Normalize undefined to null for consistent handling
    // Fixes Issue #4: Undefined vs null handling
    const normalizedYesterday = yesterdayMeetingNote ?? null;
    const normalizedLastRecorded = lastRecordedNote ?? null;
    
    // Calculate yesterday date string for validation
    const yesterdayDate = (() => {
      try {
        const selectedDateObj = parseISO(selectedDate);
        const yesterday = new Date(selectedDateObj);
        yesterday.setDate(yesterday.getDate() - 1);
        return format(yesterday, 'yyyy-MM-dd');
      } catch {
        return '';
      }
    })();
    
    // Check if we're still loading critical data
    // Fixes Issue #3: Race condition handling
    const stillLoading = isLoading || isYesterdayLoading || isLastRecordedLoading;
    const isReady = !stillLoading;
    
    // Validate content meaningfulness
    const yesterdayHasContent = hasValidContent(normalizedYesterday);
    const lastRecordedHasContent = hasValidContent(normalizedLastRecorded);
    const isValidLastRecorded = isValidLastRecordedDate(normalizedLastRecorded, yesterdayDate);
    
    // Core display logic - centralized and clear
    // First determine if last recorded should be shown
    const shouldShowLastRecorded = isReady && 
                                  !yesterdayHasContent && // Only when yesterday has no meaningful content
                                  lastRecordedHasContent && // And last recorded has content
                                  isValidLastRecorded; // And is actually older than yesterday
    
    // Only show yesterday when we're not showing last recorded (mutually exclusive)
    const shouldShowYesterday = !shouldShowLastRecorded;
    
    // Prepare display data
    const yesterdayDisplay = {
      note: normalizedYesterday,
      hasContent: yesterdayHasContent,
      dateLabel: yesterdayDate ? createDateLabel(yesterdayDate) : 'Yesterday'
    };
    
    const lastRecordedDisplay = shouldShowLastRecorded && normalizedLastRecorded ? {
      note: normalizedLastRecorded,
      hasContent: lastRecordedHasContent,
      dateLabel: createDateLabel(normalizedLastRecorded.note_date)
    } : null;
    
    return {
      shouldShowYesterday,
      shouldShowLastRecorded,
      yesterdayDisplay,
      lastRecordedDisplay,
      isLoading: stillLoading,
      isReady,
      error: null // Could add specific error handling logic in the future
    };
  }, [
    yesterdayMeetingNote, 
    lastRecordedNote, 
    selectedDate, 
    isLoading, 
    isYesterdayLoading, 
    isLastRecordedLoading
  ]);
};

// Export helper functions for testing
export { hasValidContent, createDateLabel, isValidLastRecordedDate };
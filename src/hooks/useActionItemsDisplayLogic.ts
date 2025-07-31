import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { ActionItem } from './usePillarDataOptimized';

/**
 * Centralized business logic for action items display decisions
 * Follows the same pattern as useNotesDisplayLogic:
 * - Empty content validation
 * - Consistent date handling  
 * - Race condition handling
 * - Proper loading states
 */

interface ActionItemsDisplayState {
  // What should be displayed
  shouldShowYesterday: boolean;
  shouldShowLastRecorded: boolean;
  
  // Processed display data
  yesterdayDisplay: {
    items: ActionItem[];
    hasContent: boolean;
    dateLabel: string;
  };
  
  lastRecordedDisplay: {
    items: ActionItem[];
    hasContent: boolean;
    dateLabel: string;
  } | null;
  
  // Loading and error states
  isLoading: boolean;
  isReady: boolean; // All required data loaded
  error: string | null;
}

interface UseActionItemsDisplayLogicProps {
  yesterdayActionItems?: ActionItem[];
  lastRecordedActionItems?: ActionItem[];
  selectedDate: string;
  isLoading?: boolean;
  isYesterdayLoading?: boolean;
  isLastRecordedActionItemsLoading?: boolean;
}

/**
 * Validates if action items have meaningful content
 * Similar to hasValidContent for notes
 */
function hasValidActionItems(items: ActionItem[] | null | undefined): boolean {
  if (!items || items.length === 0) return false;
  
  // Check if any items have meaningful descriptions
  const result = items.some(item => {
    const hasValidDesc = item.description && item.description.trim().length > 0;
    return hasValidDesc;
  });
  
  
  return result;
}

/**
 * Creates consistent date labels using same date parsing approach
 * Same as notes logic for consistency
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
 * Validates that lastRecordedActionItems are actually older than yesterday
 * Gets the most recent date from the items array
 */
function isValidLastRecordedDate(
  lastRecordedActionItems: ActionItem[] | null,
  yesterdayDate: string
): boolean {
  if (!lastRecordedActionItems || lastRecordedActionItems.length === 0) return false;
  
  try {
    // Find the most recent date from the items
    const mostRecentDate = lastRecordedActionItems
      .map(item => parseISO(item.item_date))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    
    const yesterday = parseISO(yesterdayDate);
    return mostRecentDate < yesterday;
  } catch {
    return false;
  }
}

/**
 * Gets the most recent date from action items for display label
 */
function getMostRecentItemDate(items: ActionItem[]): string {
  if (items.length === 0) return '';
  
  try {
    const dates = items.map(item => parseISO(item.item_date));
    const mostRecent = dates.sort((a, b) => b.getTime() - a.getTime())[0];
    return format(mostRecent, 'yyyy-MM-dd');
  } catch {
    return items[0]?.item_date || '';
  }
}

export const useActionItemsDisplayLogic = ({
  yesterdayActionItems,
  lastRecordedActionItems,
  selectedDate,
  isLoading = false,
  isYesterdayLoading = false,
  isLastRecordedActionItemsLoading = false
}: UseActionItemsDisplayLogicProps): ActionItemsDisplayState => {
  
  return useMemo(() => {
    // Normalize undefined to empty arrays for consistent handling
    const normalizedYesterday = yesterdayActionItems ?? [];
    const normalizedLastRecorded = lastRecordedActionItems ?? [];
    
    
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
    const stillLoading = isLoading || isYesterdayLoading || isLastRecordedActionItemsLoading;
    const isReady = !stillLoading;
    
    // Validate content meaningfulness
    const yesterdayHasContent = hasValidActionItems(normalizedYesterday);
    const lastRecordedHasContent = hasValidActionItems(normalizedLastRecorded);
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
      items: normalizedYesterday,
      hasContent: yesterdayHasContent,
      dateLabel: yesterdayDate ? createDateLabel(yesterdayDate) : 'Yesterday'
    };
    
    const lastRecordedDisplay = shouldShowLastRecorded && normalizedLastRecorded.length > 0 ? {
      items: normalizedLastRecorded,
      hasContent: lastRecordedHasContent,
      dateLabel: createDateLabel(getMostRecentItemDate(normalizedLastRecorded))
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
    yesterdayActionItems, 
    lastRecordedActionItems, 
    selectedDate, 
    isLoading, 
    isYesterdayLoading, 
    isLastRecordedActionItemsLoading
  ]);
};

// Export helper functions for testing
export { hasValidActionItems, createDateLabel, isValidLastRecordedDate, getMostRecentItemDate };
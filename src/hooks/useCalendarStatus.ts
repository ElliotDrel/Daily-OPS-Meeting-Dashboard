// Calendar status hook - manages date status indicators for transcript calendar
// Following patterns from existing hooks

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, isAfter } from 'date-fns';
import { TranscriptService } from '@/services/transcriptService';
import { CalendarStatus, CalendarDateStatus, UseCalendarStatusReturn } from '@/types/transcript';

export const useCalendarStatus = (currentMonth: Date): UseCalendarStatusReturn => {
  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  const today = useMemo(() => new Date(), []);

  // Fetch dates that have transcripts in the current month
  const { data: transcriptDates = [], isLoading } = useQuery({
    queryKey: ['transcript-dates', startDate, endDate],
    queryFn: () => TranscriptService.getTranscriptDates(startDate, endDate),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000,    // Keep in cache for 5 minutes
  });

  // Determine status for a specific date
  const getDateStatus = useCallback((date: Date): CalendarStatus => {
    const dateString = format(date, 'yyyy-MM-dd');
    const hasTranscript = transcriptDates.includes(dateString);
    
    if (hasTranscript) return 'saved';
    if (isAfter(date, today)) return 'future';
    return 'empty';
  }, [transcriptDates, today]);

  // Get full calendar date status object
  const getCalendarDateStatus = useCallback((date: Date): CalendarDateStatus => {
    const status = getDateStatus(date);
    return {
      date: format(date, 'yyyy-MM-dd'),
      status,
      hasTranscript: status === 'saved'
    };
  }, [getDateStatus]);

  return {
    getDateStatus,
    getCalendarDateStatus,
    isLoading
  };
};
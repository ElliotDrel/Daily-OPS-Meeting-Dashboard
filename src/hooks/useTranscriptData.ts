// Transcript data fetching hook - React Query integration
// Following patterns from usePillarData.ts

import { useQuery } from '@tanstack/react-query';
import { TranscriptService } from '@/services/transcriptService';
import { UseTranscriptDataReturn } from '@/types/transcript';

export const useTranscriptData = (date: string): UseTranscriptDataReturn => {
  const {
    data: transcript = null,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transcript', date],
    queryFn: () => TranscriptService.getTranscriptByDate(date),
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
  });

  return {
    transcript,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
// useChartData Hook - React hook for integrating chart transformation service with components
// Provides caching and error handling for real collected data only

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChartData, DonutData } from '@/data/mockData';
import { 
  chartTransformationService, 
  PillarName, 
  InsufficientDataError,
  ChartTransformationError 
} from '@/services/chartTransformation';

interface UseChartDataOptions {
  enabled?: boolean;           // Whether to fetch data (default: true)
  months?: number;            // Number of months for line charts (default: 5)
  days?: number;              // Number of days for pie charts (default: 30)
}

interface UseChartDataWithStrategyOptions {
  enabled?: boolean;           // Whether to fetch data (default: true)
  strategyName?: string;      // Strategy name for time period logic (default: 'month')
  days?: number;              // Number of days for pie charts (default: 30)
  selectedDate?: string;      // Selected date for time period calculation (YYYY-MM-DD format)
}

interface ChartDataResult {
  lineData: LineChartData[];
  pieData: DonutData[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasRealData: boolean;
  dataStatus: {
    hasLineData: boolean;
    hasPieData: boolean;
    dataPointsCount: number;
    oldestDataDate: string | null;
    newestDataDate: string | null;
  } | null;
  refetch: () => void;
}

/**
 * Hook for getting chart data for a pillar - shows real data only
 */
export const useChartData = (
  pillar: PillarName, 
  options: UseChartDataOptions = {}
): ChartDataResult => {
  const {
    enabled = true,
    months = 5,
    days = 30
  } = options;

  // Query for line chart data
  const lineQuery = useQuery({
    queryKey: ['chart-line-data', pillar, months],
    queryFn: async () => {
      return await chartTransformationService.getLineChartData(pillar, months);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on insufficient data errors
      if (error instanceof InsufficientDataError) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Query for pie chart data
  const pieQuery = useQuery({
    queryKey: ['chart-pie-data', pillar, days],
    queryFn: async () => {
      return await chartTransformationService.getPieChartData(pillar, days);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on insufficient data errors
      if (error instanceof InsufficientDataError) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Query for data status
  const statusQuery = useQuery({
    queryKey: ['chart-data-status', pillar],
    queryFn: () => chartTransformationService.getDataStatus(pillar),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000   // 5 minutes
  });

  // Determine if we have real data
  const hasRealData = React.useMemo(() => {
    if (!statusQuery.data) return false;
    return statusQuery.data.hasLineData && statusQuery.data.hasPieData;
  }, [statusQuery.data]);

  // Handle refetch for all queries
  const refetch = () => {
    lineQuery.refetch();
    pieQuery.refetch();
    statusQuery.refetch();
  };

  return {
    lineData: lineQuery.data || [],
    pieData: pieQuery.data || [],
    isLoading: lineQuery.isLoading || pieQuery.isLoading || statusQuery.isLoading,
    isError: lineQuery.isError || pieQuery.isError || statusQuery.isError,
    error: lineQuery.error || pieQuery.error || statusQuery.error || null,
    hasRealData,
    dataStatus: statusQuery.data || null,
    refetch
  };
};

/**
 * Hook for getting chart data for a pillar using time period strategies - shows real data only
 */
export const useChartDataWithStrategy = (
  pillar: PillarName, 
  options: UseChartDataWithStrategyOptions = {}
): ChartDataResult => {
  const {
    enabled = true,
    strategyName = 'month',
    days = 30,
    selectedDate
  } = options;

  // Query for line chart data using strategy
  const lineQuery = useQuery({
    queryKey: ['chart-line-data-strategy', pillar, strategyName, selectedDate],
    queryFn: async () => {
      return await chartTransformationService.getLineChartDataWithStrategy(pillar, strategyName, selectedDate);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on insufficient data errors
      if (error instanceof InsufficientDataError) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Query for pie chart data (same as before)
  const pieQuery = useQuery({
    queryKey: ['chart-pie-data-strategy', pillar, days],
    queryFn: async () => {
      return await chartTransformationService.getPieChartData(pillar, days);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on insufficient data errors
      if (error instanceof InsufficientDataError) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Query for data status
  const statusQuery = useQuery({
    queryKey: ['chart-data-status-strategy', pillar],
    queryFn: () => chartTransformationService.getDataStatus(pillar),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000   // 5 minutes
  });

  // Determine if we have real data - strategy-based approach
  const hasRealData = React.useMemo(() => {
    // For strategy-based charts, we base hasRealData on actual data returned
    // rather than strict minimum requirements from statusQuery
    const hasLineChartData = lineQuery.data && lineQuery.data.length > 0;
    const hasPieChartData = pieQuery.data && pieQuery.data.length > 0;
    
    // For line charts with strategy, we only need line data (pie is optional)
    return hasLineChartData || hasPieChartData;
  }, [lineQuery.data, pieQuery.data]);

  // Handle refetch for all queries
  const refetch = () => {
    lineQuery.refetch();
    pieQuery.refetch();
    statusQuery.refetch();
  };

  return {
    lineData: lineQuery.data || [],
    pieData: pieQuery.data || [],
    isLoading: lineQuery.isLoading || pieQuery.isLoading || statusQuery.isLoading,
    isError: lineQuery.isError || pieQuery.isError || statusQuery.isError,
    error: lineQuery.error || pieQuery.error || statusQuery.error || null,
    hasRealData,
    dataStatus: statusQuery.data || null,
    refetch
  };
};

/**
 * Hook for invalidating chart data cache (call after data submission)
 */
export const useInvalidateChartData = () => {
  return (pillar: PillarName) => {
    chartTransformationService.invalidateCache(pillar);
  };
};

/**
 * Hook for checking data sufficiency without fetching full chart data
 */
export const useChartDataSufficiency = (pillar: PillarName) => {
  return useQuery({
    queryKey: ['chart-data-sufficiency', pillar],
    queryFn: async () => {
      const [hasLineData, hasPieData] = await Promise.all([
        chartTransformationService.hasSufficientData(pillar, 'line'),
        chartTransformationService.hasSufficientData(pillar, 'pie')
      ]);
      return { hasLineData, hasPieData };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  });
};


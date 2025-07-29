// Aggregation Utilities for Chart Data Transformation
// Reusable functions for transforming collected data into chart formats

import { LineChartData, DonutData } from '@/data/mockData';
import { PillarResponse } from '@/types/dataCollection';
import { AggregationFunctions } from './types';

// Color palettes for consistent chart styling
const PIE_CHART_COLORS = [
  '#ef4444', // red
  '#f97316', // orange  
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#84cc16', // lime
  '#f59e0b'  // amber
];

// Month names for consistent formatting
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Get the last N months in chronological order
 */
const getLastNMonths = (months: number): string[] => {
  const result: string[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(MONTH_NAMES[date.getMonth()]);
  }
  
  return result;
};

/**
 * Group responses by month for aggregation
 */
const groupResponsesByMonth = (responses: PillarResponse[]): Map<string, PillarResponse[]> => {
  const groups = new Map<string, PillarResponse[]>();
  
  responses.forEach(response => {
    const date = new Date(response.responseDate);
    const monthKey = MONTH_NAMES[date.getMonth()];
    
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(response);
  });
  
  return groups;
};

/**
 * Core aggregation functions implementation
 */
export const aggregationUtils: AggregationFunctions = {
  /**
   * Aggregate daily responses into monthly averages for line charts
   */
  aggregateToMonthly: (
    responses: PillarResponse[], 
    valueExtractor: (response: PillarResponse) => number,
    months: number = 5
  ): LineChartData[] => {
    if (responses.length === 0) {
      return [];
    }

    // Get the target months in chronological order
    const targetMonths = getLastNMonths(months);
    const monthGroups = groupResponsesByMonth(responses);
    
    return targetMonths.map(month => {
      const monthResponses = monthGroups.get(month) || [];
      
      if (monthResponses.length === 0) {
        return {
          month,
          value: 0,
          target: 0
        };
      }
      
      // Calculate average value for the month
      const values = monthResponses.map(valueExtractor).filter(v => !isNaN(v));
      const average = values.length > 0 
        ? values.reduce((sum, val) => sum + val, 0) / values.length 
        : 0;
      
      return {
        month,
        value: Math.round(average * 100) / 100, // Round to 2 decimal places
        target: 0 // Will be set by the service using target configuration
      };
    });
  },

  /**
   * Count categorical values and convert to pie chart format
   */
  aggregateCategorical: (
    responses: PillarResponse[],
    categoryExtractor: (response: PillarResponse) => string[]
  ): DonutData[] => {
    if (responses.length === 0) {
      return [];
    }

    // Count all categories across all responses
    const categoryCounts = new Map<string, number>();
    
    responses.forEach(response => {
      const categories = categoryExtractor(response);
      categories.forEach(category => {
        if (category && category.trim()) {
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        }
      });
    });

    // Convert to array and sort by count (descending)
    const sortedCategories = Array.from(categoryCounts.entries())
      .sort(([, a], [, b]) => b - a);

    // Generate colors for categories
    const colors = aggregationUtils.generateColorScheme(
      sortedCategories.map(([category]) => category)
    );

    return sortedCategories.map(([category, count]) => ({
      name: category,
      value: count,
      color: colors[category]
    }));
  },

  /**
   * Calculate adaptive target from historical data
   */
  calculateAdaptiveTarget: (
    responses: PillarResponse[],
    valueExtractor: (response: PillarResponse) => number,
    percentile: number = 0.8 // 80th percentile as target
  ): number => {
    if (responses.length === 0) {
      return 0;
    }

    const values = responses
      .map(valueExtractor)
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return 0;
    }

    // Calculate percentile value as target
    const index = Math.floor(values.length * percentile);
    const target = index < values.length ? values[index] : values[values.length - 1];
    
    return Math.round(target * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Generate consistent color scheme for categories
   */
  generateColorScheme: (categories: string[]): { [category: string]: string } => {
    const colorScheme: { [category: string]: string } = {};
    
    categories.forEach((category, index) => {
      colorScheme[category] = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length];
    });
    
    return colorScheme;
  }
};

/**
 * Utility functions for date handling
 */
export const dateUtils = {
  /**
   * Check if a date is within the last N days
   */
  isWithinLastNDays: (date: string, days: number): boolean => {
    const targetDate = new Date(date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return targetDate >= cutoffDate;
  },

  /**
   * Filter responses to only include recent data
   */
  filterRecentResponses: (responses: PillarResponse[], days: number): PillarResponse[] => {
    return responses.filter(response => 
      dateUtils.isWithinLastNDays(response.responseDate, days)
    );
  },

  /**
   * Get the date range covered by responses
   */
  getDateRange: (responses: PillarResponse[]): { oldest: string | null; newest: string | null } => {
    if (responses.length === 0) {
      return { oldest: null, newest: null };
    }

    const dates = responses
      .map(r => new Date(r.responseDate))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      oldest: dates[0].toISOString().split('T')[0],
      newest: dates[dates.length - 1].toISOString().split('T')[0]
    };
  }
};

/**
 * Validation utilities for data quality
 */
export const validationUtils = {
  /**
   * Check if response data contains valid numeric values
   */
  hasValidNumericData: (responses: PillarResponse[], key: string): boolean => {
    return responses.some(response => {
      const value = response.responses[key];
      return typeof value === 'number' && !isNaN(value);
    });
  },

  /**
   * Check if response data contains valid categorical data
   */
  hasValidCategoricalData: (responses: PillarResponse[], key: string): boolean => {
    return responses.some(response => {
      const value = response.responses[key];
      return (typeof value === 'string' && value.trim()) || 
             (Array.isArray(value) && value.length > 0);
    });
  },

  /**
   * Get data quality metrics for a set of responses
   */
  getDataQuality: (responses: PillarResponse[]): {
    totalResponses: number;
    dateRange: { oldest: string | null; newest: string | null };
    hasRecentData: boolean;
    dataCompleteness: number; // Percentage of days with data in the last 30 days
  } => {
    const dateRange = dateUtils.getDateRange(responses);
    const recentResponses = dateUtils.filterRecentResponses(responses, 30);
    
    // Calculate data completeness for last 30 days
    const uniqueDates = new Set(recentResponses.map(r => r.responseDate));
    const dataCompleteness = (uniqueDates.size / 30) * 100;

    return {
      totalResponses: responses.length,
      dateRange,
      hasRecentData: recentResponses.length > 0,
      dataCompleteness: Math.round(dataCompleteness * 100) / 100
    };
  }
};
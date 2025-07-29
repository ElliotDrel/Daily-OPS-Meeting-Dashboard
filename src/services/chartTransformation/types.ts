// Chart Transformation Service Types
// This file defines all interfaces and types for transforming collected data into chart format

import { LineChartData, DonutData } from '@/data/mockData';
import { PillarResponse } from '@/types/dataCollection';

// Pillar names - ensures type safety for pillar references
export type PillarName = 'safety' | 'quality' | 'cost' | 'delivery' | 'inventory' | 'production';

// Chart data types - re-export for consistency
export type { LineChartData, DonutData };

// Data sufficiency configuration
export interface DataSufficiencyConfig {
  minDataPointsForLine: number;    // Minimum days of data needed for line charts
  minDataPointsForPie: number;     // Minimum days of data needed for pie charts
  monthsToAnalyze: number;         // How many months back to look for trends
}

// Target configuration for charts
export interface ChartTargetConfig {
  [pillar: string]: {
    lineChartTarget?: number;      // Static target value for line charts
    adaptiveTarget?: boolean;      // Whether to calculate target from historical data
    targetCalculationDays?: number; // Days to look back for adaptive targets
  };
}

// Main service interface
export interface ChartTransformationService {
  // Get line chart data for a pillar (monthly trends)
  getLineChartData(pillar: PillarName, months?: number): Promise<LineChartData[]>;
  
  // Get pie chart data for a pillar (categorical breakdowns)
  getPieChartData(pillar: PillarName, days?: number): Promise<DonutData[]>;
  
  // Check if we have sufficient data for accurate charts
  hasSufficientData(pillar: PillarName, chartType: 'line' | 'pie'): Promise<boolean>;
  
  // Invalidate cached data for a pillar (call after new data submission)
  invalidateCache(pillar: PillarName): void;
  
  // Get data sufficiency status for UI feedback
  getDataStatus(pillar: PillarName): Promise<{
    hasLineData: boolean;
    hasPieData: boolean;
    dataPointsCount: number;
    oldestDataDate: string | null;
    newestDataDate: string | null;
  }>;
}

// Individual pillar transformer interface
export interface PillarTransformer {
  // Transform collected responses into line chart format
  transformToLineChart(responses: PillarResponse[], config: ChartTargetConfig): Promise<LineChartData[]>;
  
  // Transform collected responses into pie chart format  
  transformToPieChart(responses: PillarResponse[]): Promise<DonutData[]>;
  
  // Check if this transformer can handle the given responses
  canTransform(responses: PillarResponse[]): boolean;
  
  // Get the pillar this transformer handles
  getPillarName(): PillarName;
}

// Aggregation function types for reusable logic
export interface AggregationFunctions {
  // Aggregate daily responses into monthly averages
  aggregateToMonthly(responses: PillarResponse[], valueExtractor: (response: PillarResponse) => number): LineChartData[];
  
  // Count categorical values and convert to percentages
  aggregateCategorical(responses: PillarResponse[], categoryExtractor: (response: PillarResponse) => string[]): DonutData[];
  
  // Calculate adaptive targets from historical data
  calculateAdaptiveTarget(responses: PillarResponse[], valueExtractor: (response: PillarResponse) => number): number;
  
  // Generate color schemes for pie charts
  generateColorScheme(categories: string[]): { [category: string]: string };
}

// Cache entry structure for performance optimization
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  pillar: PillarName;
  parameters: string; // Serialized parameters for cache key uniqueness
}

// Error types for proper error handling
export class ChartTransformationError extends Error {
  constructor(
    message: string,
    public readonly pillar: PillarName,
    public readonly chartType: 'line' | 'pie',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ChartTransformationError';
  }
}

export class InsufficientDataError extends ChartTransformationError {
  constructor(
    pillar: PillarName,
    chartType: 'line' | 'pie',
    available: number,
    required: number
  ) {
    super(
      `Insufficient data for ${chartType} chart in ${pillar} pillar. Available: ${available}, Required: ${required}`,
      pillar,
      chartType
    );
    this.name = 'InsufficientDataError';
  }
}

// Configuration constants
export const DEFAULT_CONFIG: DataSufficiencyConfig = {
  minDataPointsForLine: 10,  // Need at least 10 days for meaningful trends
  minDataPointsForPie: 5,    // Need at least 5 days for pie chart breakdown
  monthsToAnalyze: 5         // Analyze last 5 months for line charts
};

export const DEFAULT_TARGETS: ChartTargetConfig = {
  safety: {
    lineChartTarget: 0,      // Target zero incidents
    adaptiveTarget: false
  },
  quality: {
    lineChartTarget: 95,     // Target 95% quality score
    adaptiveTarget: false
  },
  cost: {
    adaptiveTarget: true,    // Calculate from historical data
    targetCalculationDays: 30
  },
  delivery: {
    lineChartTarget: 95,     // Target 95% on-time delivery
    adaptiveTarget: false
  },
  inventory: {
    adaptiveTarget: true,    // Calculate from historical averages
    targetCalculationDays: 30
  },
  production: {
    adaptiveTarget: true,    // Calculate from planned vs actual
    targetCalculationDays: 30
  }
};

// Cache configuration
export const CACHE_CONFIG = {
  TTL_MINUTES: 5,            // Cache entries valid for 5 minutes
  MAX_ENTRIES: 100,          // Maximum cache entries to prevent memory issues
  CLEANUP_INTERVAL_MINUTES: 15 // Clean up expired entries every 15 minutes
};
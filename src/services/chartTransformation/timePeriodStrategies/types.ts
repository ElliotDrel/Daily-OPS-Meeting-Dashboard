// Time Period Strategy Types
// Defines interfaces and types for the time period strategy system

import { PillarResponse } from '@/types/dataCollection';
import { LineChartData } from '@/data/mockData';

export interface StrategyDateRange {
  startDate: Date;
  endDate: Date;
  description: string;
  periods: Array<{
    label: string;
    startDate: Date;
    endDate: Date;
    isFuture?: boolean;
  }>;
}

export interface TimePeriodStrategy {
  /**
   * Get the unique name identifier for this strategy
   */
  getStrategyName(): string;
  
  /**
   * Get display information for this strategy
   */
  getDisplayInfo(): {
    label: string;
    description: string;
  };
  
  /**
   * Calculate the appropriate date range for this strategy
   */
  calculateDateRange(referenceDate?: Date): StrategyDateRange;
  
  /**
   * Transform pillar responses into chart data using this strategy's aggregation method
   */
  aggregateToChartData(
    responses: PillarResponse[], 
    valueExtractor: (response: PillarResponse) => number,
    referenceDate?: Date
  ): LineChartData[];
  
  /**
   * Check if this strategy can handle the given data
   */
  canHandle(responses: PillarResponse[]): boolean;
}

export interface TimePeriodStrategyFactory {
  /**
   * Get a strategy instance by name
   */
  getStrategy(strategyName: string): TimePeriodStrategy | null;
  
  /**
   * Get all available strategies
   */
  getAllStrategies(): TimePeriodStrategy[];
  
  /**
   * Register a new strategy
   */
  registerStrategy(strategy: TimePeriodStrategy): void;
}

export type StrategyName = 'week' | 'month' | '3month' | '6month';

export const STRATEGY_DISPLAY_MAP: Record<StrategyName, { label: string; description: string }> = {
  week: {
    label: '1 Week',
    description: 'Work week around today (daily view)'
  },
  month: {
    label: '1 Month', 
    description: 'Current month broken into weeks'
  },
  '3month': {
    label: '3 Months',
    description: 'Last 3 months with monthly totals'
  },
  '6month': {
    label: '6 Months', 
    description: 'Last 6 months with monthly totals'
  }
};
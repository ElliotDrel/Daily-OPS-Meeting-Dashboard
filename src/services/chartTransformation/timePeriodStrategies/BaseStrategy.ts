// Base Time Period Strategy
// Provides common functionality for all time period strategies

import { PillarResponse } from '@/types/dataCollection';
import { LineChartData } from '@/data/mockData';
import { TimePeriodStrategy, StrategyDateRange, StrategyName } from './types';
import { isDateInRange, formatDateString } from '../dateRangeUtils';

export abstract class BaseTimePeriodStrategy implements TimePeriodStrategy {
  protected readonly strategyName: StrategyName;
  
  constructor(strategyName: StrategyName) {
    this.strategyName = strategyName;
  }
  
  abstract getStrategyName(): string;
  abstract getDisplayInfo(): { label: string; description: string };
  abstract calculateDateRange(referenceDate?: Date): StrategyDateRange;
  abstract aggregateToChartData(
    responses: PillarResponse[], 
    valueExtractor: (response: PillarResponse) => number,
    referenceDate?: Date
  ): LineChartData[];
  
  /**
   * Basic validation that responses contain data
   */
  canHandle(responses: PillarResponse[]): boolean {
    return responses && responses.length > 0;
  }
  
  /**
   * Filter responses to only include those within the strategy's date range
   */
  protected filterResponsesByDateRange(
    responses: PillarResponse[], 
    dateRange: StrategyDateRange
  ): PillarResponse[] {
    const filtered = responses.filter(response => {
      // Parse date string as local date to avoid timezone issues
      const [year, month, day] = response.responseDate.split('-').map(Number);
      const responseDate = new Date(year, month - 1, day); // month is 0-indexed
      const inRange = isDateInRange(responseDate, dateRange.startDate, dateRange.endDate);
      
      return inRange;
    });
    
    return filtered;
  }
  
  /**
   * Group responses by date string (YYYY-MM-DD)
   */
  protected groupResponsesByDate(responses: PillarResponse[]): Map<string, PillarResponse[]> {
    const groups = new Map<string, PillarResponse[]>();
    
    responses.forEach(response => {
      const dateString = response.responseDate; // Already in YYYY-MM-DD format
      if (!groups.has(dateString)) {
        groups.set(dateString, []);
      }
      groups.get(dateString)!.push(response);
    });
    
    return groups;
  }
  
  /**
   * Group responses by week (returns map keyed by week start date)
   */
  protected groupResponsesByWeek(responses: PillarResponse[]): Map<string, PillarResponse[]> {
    const groups = new Map<string, PillarResponse[]>();
    
    responses.forEach(response => {
      const responseDate = new Date(response.responseDate);
      const weekStart = this.getWeekStartDate(responseDate);
      const weekKey = formatDateString(weekStart);
      
      if (!groups.has(weekKey)) {
        groups.set(weekKey, []);
      }
      groups.get(weekKey)!.push(response);
    });
    
    return groups;
  }
  
  /**
   * Group responses by month (returns map keyed by YYYY-MM)
   */
  protected groupResponsesByMonth(responses: PillarResponse[]): Map<string, PillarResponse[]> {
    const groups = new Map<string, PillarResponse[]>();
    
    responses.forEach(response => {
      const responseDate = new Date(response.responseDate);
      const monthKey = `${responseDate.getFullYear()}-${(responseDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(response);
    });
    
    return groups;
  }
  
  /**
   * Calculate total value from responses using the value extractor
   */
  protected calculateTotalValue(
    responses: PillarResponse[], 
    valueExtractor: (response: PillarResponse) => number
  ): number {
    const values = responses.map(valueExtractor).filter(v => !isNaN(v));
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) : 0;
  }
  
  /**
   * Get the start of the week for a given date (Sunday)
   */
  protected getWeekStartDate(date: Date): Date {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
  
  /**
   * Get the start of the month for a given date
   */
  protected getMonthStartDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  
  
  /**
   * Create a chart data point with default values
   */
  protected createChartDataPoint(
    label: string, 
    value: number, 
    target: number = 0,
    dataType: 'recorded' | 'missing' = 'recorded'
  ): LineChartData {
    return {
      month: label,
      value: value,
      target: target,
      dataType: dataType
    };
  }
}
// Month Strategy - Current month broken into calendar weeks
// Shows weekly totals for each week in the current month

import { PillarResponse } from '@/types/dataCollection';
import { LineChartData } from '@/data/mockData';
import { BaseTimePeriodStrategy } from './BaseStrategy';
import { StrategyDateRange, STRATEGY_DISPLAY_MAP } from './types';
import { calculateMonthViewWeeks, getTodayNormalized, isDateInRange } from '../dateRangeUtils';

export class MonthStrategy extends BaseTimePeriodStrategy {
  constructor() {
    super('month');
  }
  
  getStrategyName(): string {
    return 'month';
  }
  
  getDisplayInfo(): { label: string; description: string } {
    return STRATEGY_DISPLAY_MAP.month;
  }
  
  calculateDateRange(referenceDate?: Date): StrategyDateRange {
    const today = referenceDate || getTodayNormalized();
    const weeks = calculateMonthViewWeeks(today);
    
    if (weeks.length === 0) {
      throw new Error('No weeks calculated for month view');
    }
    
    const startDate = weeks[0].startDate;
    const endDate = weeks[weeks.length - 1].endDate;
    
    const periods = weeks.map(week => ({
      label: week.label,
      startDate: week.startDate,
      endDate: week.endDate
    }));
    
    return {
      startDate,
      endDate,
      description: `Current month (${weeks.length} weeks)`,
      periods
    };
  }
  
  aggregateToChartData(
    responses: PillarResponse[], 
    valueExtractor: (response: PillarResponse) => number,
    referenceDate?: Date
  ): LineChartData[] {
    if (!this.canHandle(responses)) {
      return [];
    }
    
    const today = referenceDate || getTodayNormalized();
    const dateRange = this.calculateDateRange(today);
    const filteredResponses = this.filterResponsesByDateRange(responses, dateRange);
    
    // Group responses by date for easier lookup
    const responsesByDate = this.groupResponsesByDate(filteredResponses);
    
    // Create chart data for each week
    const chartData: LineChartData[] = [];
    
    dateRange.periods.forEach(period => {
      // Get all responses that fall within this week's date range
      const weekResponses: PillarResponse[] = [];
      
      // Check each response to see if it falls within this week
      filteredResponses.forEach(response => {
        const responseDate = new Date(response.responseDate);
        if (isDateInRange(responseDate, period.startDate, period.endDate)) {
          weekResponses.push(response);
        }
      });
      
      // Calculate total value for this week
      let totalValue = 0;
      let dataType: 'recorded' | 'missing' = 'missing';
      
      if (weekResponses.length > 0) {
        // FIXED: Sum daily incidents instead of using maximum
        // This provides the correct total incidents per week
        const values = weekResponses.map(valueExtractor).filter(v => !isNaN(v));
        totalValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) : 0;
        dataType = 'recorded';
      } else {
        // Week with no data
        totalValue = 0;
        dataType = 'missing';
      }
      
      chartData.push(this.createChartDataPoint(
        period.label,
        totalValue,
        0, // Target is always 0 for safety incidents
        dataType
      ));
    });
    
    return chartData;
  }
  
}
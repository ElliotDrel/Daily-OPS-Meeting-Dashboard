// Week Strategy - Work week around today (daily view)
// Shows yesterday, today, tomorrow, and next 2 workdays

import { PillarResponse } from '@/types/dataCollection';
import { LineChartData } from '@/data/mockData';
import { BaseTimePeriodStrategy } from './BaseStrategy';
import { StrategyDateRange, STRATEGY_DISPLAY_MAP } from './types';
import { calculateWeekViewDates, getTodayNormalized } from '../dateRangeUtils';

export class WeekStrategy extends BaseTimePeriodStrategy {
  constructor() {
    super('week');
  }
  
  getStrategyName(): string {
    return 'week';
  }
  
  getDisplayInfo(): { label: string; description: string } {
    return STRATEGY_DISPLAY_MAP.week;
  }
  
  calculateDateRange(referenceDate?: Date): StrategyDateRange {
    const today = referenceDate || getTodayNormalized();
    const weekDates = calculateWeekViewDates(today);
    
    const startDate = weekDates[0].date;
    const endDate = weekDates[weekDates.length - 1].date;
    
    const periods = weekDates.map(dateInfo => ({
      label: dateInfo.label,
      startDate: dateInfo.date,
      endDate: dateInfo.date
    }));
    
    return {
      startDate,
      endDate,
      description: `Work week around today (${weekDates.length} days)`,
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
    
    // Group responses by date
    const responsesByDate = this.groupResponsesByDate(filteredResponses);
    
    // Create chart data for each day in the week view
    const chartData: LineChartData[] = [];
    
    dateRange.periods.forEach(period => {
      const dateString = period.startDate.toISOString().split('T')[0];
      const dayResponses = responsesByDate.get(dateString) || [];
      
      // Calculate total value for this day
      let totalValue = 0;
      let dataType: 'recorded' | 'missing' = 'missing';
      
      if (dayResponses.length > 0) {
        totalValue = this.calculateTotalValue(dayResponses, valueExtractor);
        dataType = 'recorded';
      } else {
        // Day with no data
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
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
      endDate: dateInfo.date,
      isFuture: dateInfo.isFuture
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
    console.log(`[WeekStrategy] Starting aggregation with ${responses.length} responses`);
    
    if (!this.canHandle(responses)) {
      console.log(`[WeekStrategy] Cannot handle responses - returning empty array`);
      return [];
    }
    
    const today = referenceDate || getTodayNormalized();
    console.log(`[WeekStrategy] Using reference date: ${today.toISOString().split('T')[0]}`);
    
    const dateRange = this.calculateDateRange(today);
    console.log(`[WeekStrategy] Date range: ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`);
    
    const filteredResponses = this.filterResponsesByDateRange(responses, dateRange);
    console.log(`[WeekStrategy] Filtered responses: ${filteredResponses.length}`);
    
    // Group responses by date
    const responsesByDate = this.groupResponsesByDate(filteredResponses);
    
    // Create chart data for each day in the week view
    const chartData: LineChartData[] = [];
    
    dateRange.periods.forEach(period => {
      const dateString = period.startDate.toISOString().split('T')[0];
      const dayResponses = responsesByDate.get(dateString) || [];
      
      // Calculate total value for this day
      let totalValue = 0;
      if (dayResponses.length > 0) {
        totalValue = this.calculateTotalValue(dayResponses, valueExtractor);
      } else if (period.isFuture) {
        // Future dates show as empty/zero
        totalValue = 0;
      }
      
      chartData.push(this.createChartDataPoint(
        period.label,
        totalValue,
        0 // Target is always 0 for safety incidents
      ));
      
      console.log(`[WeekStrategy] Created chart point: ${period.label} = ${totalValue}`);
    });
    
    console.log(`[WeekStrategy] Final chart data (${chartData.length} points):`, chartData);
    return chartData;
  }
}
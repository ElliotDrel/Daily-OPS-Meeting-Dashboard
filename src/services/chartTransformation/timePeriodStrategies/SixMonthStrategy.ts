// Six Month Strategy - Last 6 months with monthly totals
// Shows monthly totals for current month plus 5 previous months

import { PillarResponse } from '@/types/dataCollection';
import { LineChartData } from '@/data/mockData';
import { BaseTimePeriodStrategy } from './BaseStrategy';
import { StrategyDateRange, STRATEGY_DISPLAY_MAP } from './types';
import { calculateMultiMonthView, getTodayNormalized, isDateInRange } from '../dateRangeUtils';

export class SixMonthStrategy extends BaseTimePeriodStrategy {
  constructor() {
    super('6month');
  }
  
  getStrategyName(): string {
    return '6month';
  }
  
  getDisplayInfo(): { label: string; description: string } {
    return STRATEGY_DISPLAY_MAP['6month'];
  }
  
  calculateDateRange(referenceDate?: Date): StrategyDateRange {
    const today = referenceDate || getTodayNormalized();
    const months = calculateMultiMonthView(6, today);
    
    if (months.length === 0) {
      throw new Error('No months calculated for 6-month view');
    }
    
    const startDate = months[0].startDate;
    const endDate = months[months.length - 1].endDate;
    
    const periods = months.map(month => ({
      label: month.label,
      startDate: month.startDate,
      endDate: month.endDate,
      isFuture: this.isMonthInFuture(month.startDate, month.endDate, today)
    }));
    
    return {
      startDate,
      endDate,
      description: `Last 6 months (${months.length} months)`,
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
    
    // Create chart data for each month
    const chartData: LineChartData[] = [];
    
    dateRange.periods.forEach(period => {
      // Get all responses that fall within this month's date range
      const monthResponses: PillarResponse[] = [];
      
      filteredResponses.forEach(response => {
        const responseDate = new Date(response.responseDate);
        if (isDateInRange(responseDate, period.startDate, period.endDate)) {
          monthResponses.push(response);
        }
      });
      
      // Calculate total value for this month
      let totalValue = 0;
      if (monthResponses.length > 0) {
        totalValue = this.calculateTotalValue(monthResponses, valueExtractor);
      } else if (period.isFuture) {
        // Future months show as empty/zero (shouldn't happen for this strategy)
        totalValue = 0;
      }
      
      chartData.push(this.createChartDataPoint(
        period.label,
        totalValue,
        0 // Target is always 0 for safety incidents
      ));
    });
    
    return chartData;
  }
  
  /**
   * Check if a month is in the future (entire month is future)
   */
  private isMonthInFuture(startDate: Date, endDate: Date, referenceDate: Date): boolean {
    // A month is considered "future" if its start date is after today
    const normalizedDate = new Date(startDate);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const normalizedReference = new Date(referenceDate);
    normalizedReference.setHours(0, 0, 0, 0);
    
    return normalizedDate > normalizedReference;
  }
}
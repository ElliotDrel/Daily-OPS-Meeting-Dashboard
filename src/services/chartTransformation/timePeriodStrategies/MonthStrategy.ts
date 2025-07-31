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
      console.log('[MonthStrategy] Cannot handle responses - returning empty array');
      return [];
    }
    
    const today = referenceDate || getTodayNormalized();
    console.log(`[MonthStrategy] Starting aggregation for reference date: ${today.toISOString().split('T')[0]}`);
    console.log(`[MonthStrategy] Total responses received: ${responses.length}`);
    
    const dateRange = this.calculateDateRange(today);
    console.log(`[MonthStrategy] Date range calculated: ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`);
    console.log(`[MonthStrategy] Number of periods (weeks): ${dateRange.periods.length}`);
    
    const filteredResponses = this.filterResponsesByDateRange(responses, dateRange);
    console.log(`[MonthStrategy] Responses after date filtering: ${filteredResponses.length}`);
    
    if (filteredResponses.length > 0) {
      console.log('[MonthStrategy] Sample filtered responses:');
      filteredResponses.slice(0, 3).forEach((resp, idx) => {
        console.log(`[MonthStrategy] Response ${idx + 1}: Date=${resp.responseDate}, Value=${valueExtractor(resp)}`);
      });
    }
    
    // Group responses by date for easier lookup
    const responsesByDate = this.groupResponsesByDate(filteredResponses);
    
    // Create chart data for each week
    const chartData: LineChartData[] = [];
    
    dateRange.periods.forEach((period, periodIndex) => {
      console.log(`[MonthStrategy] Processing period ${periodIndex + 1}/${dateRange.periods.length}: ${period.label}`);
      console.log(`[MonthStrategy] Period range: ${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}`);
      
      // Get all responses that fall within this week's date range
      const weekResponses: PillarResponse[] = [];
      
      // Check each response to see if it falls within this week
      filteredResponses.forEach(response => {
        // Parse date string as local date to avoid timezone issues (same as BaseStrategy)
        const [year, month, day] = response.responseDate.split('-').map(Number);
        const responseDate = new Date(year, month - 1, day); // month is 0-indexed
        const inRange = isDateInRange(responseDate, period.startDate, period.endDate);
        
        if (inRange) {
          weekResponses.push(response);
          console.log(`[MonthStrategy]   - Including response from ${response.responseDate} -> parsed as ${responseDate.toISOString().split('T')[0]} (value: ${valueExtractor(response)})`);
        } else {
          console.log(`[MonthStrategy]   - Excluding response from ${response.responseDate} -> parsed as ${responseDate.toISOString().split('T')[0]} (not in range)`);
        }
      });
      
      console.log(`[MonthStrategy] Week ${period.label} has ${weekResponses.length} responses`);
      
      // Calculate total value for this week
      let totalValue = 0;
      let dataType: 'recorded' | 'missing' = 'missing';
      
      if (weekResponses.length > 0) {
        // FIXED: Sum daily incidents instead of using maximum
        // This provides the correct total incidents per week
        const values = weekResponses.map(valueExtractor).filter(v => !isNaN(v));
        console.log(`[MonthStrategy] Raw values for week ${period.label}:`, values);
        
        totalValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) : 0;
        dataType = 'recorded';
        
        console.log(`[MonthStrategy] Week ${period.label} total value: ${totalValue} (from ${values.length} valid values)`);
      } else {
        // Week with no data
        totalValue = 0;
        dataType = 'missing';
        console.log(`[MonthStrategy] Week ${period.label} has no data - using value 0`);
      }
      
      const chartPoint = this.createChartDataPoint(
        period.label,
        totalValue,
        0, // Target is always 0 for safety incidents
        dataType
      );
      
      console.log(`[MonthStrategy] Created chart point for ${period.label}:`, chartPoint);
      chartData.push(chartPoint);
    });
    
    console.log(`[MonthStrategy] Final chart data (${chartData.length} points):`, chartData);
    return chartData;
  }
  
}
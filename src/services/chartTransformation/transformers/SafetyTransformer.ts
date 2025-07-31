// Safety Pillar Transformer
// Transforms safety incident data into chart formats

import { PillarResponse } from '@/types/dataCollection';
import { 
  PillarTransformer, 
  PillarName, 
  LineChartData, 
  DonutData, 
  ChartTargetConfig 
} from '../types';
import { aggregationUtils } from '../aggregationUtils';

export class SafetyTransformer implements PillarTransformer {
  
  getPillarName(): PillarName {
    return 'safety';
  }

  /**
   * Find the incident count field name in responses (flexible field name detection)
   */
  private findIncidentCountField(responses: PillarResponse[]): string | null {
    if (responses.length === 0) return null;
    
    // List of possible field names for incident count
    const possibleFieldNames = [
      'safety-incidents-count',
      'incidents-count', 
      'incident-count',
      'incidents',
      'safety-incidents',
      'incidentCount',
      'safetyIncidents'
    ];
    
    // Check each response for any of these field names
    for (const response of responses) {
      if (response.pillar === 'safety') {
        for (const fieldName of possibleFieldNames) {
          if (response.responses[fieldName] !== undefined) {
            console.log(`[SafetyTransformer] Found incident count field: '${fieldName}'`);
            return fieldName;
          }
        }
        // Log available fields for debugging
        const availableFields = Object.keys(response.responses);
        console.log(`[SafetyTransformer] Available fields in response:`, availableFields);
      }
    }
    
    return null;
  }

  /**
   * Check if this transformer can handle the given responses
   */
  canTransform(responses: PillarResponse[]): boolean {
    if (responses.length === 0) return false;
    
    const incidentField = this.findIncidentCountField(responses);
    const canTransform = incidentField !== null;
    
    console.log(`[SafetyTransformer] Can transform: ${canTransform}, incident field: ${incidentField}`);
    return canTransform;
  }

  /**
   * Transform safety responses into line chart format (daily or monthly incident trends)
   */
  async transformToLineChart(
    responses: PillarResponse[], 
    config: ChartTargetConfig,
    timePeriod?: { days: number; useDailyAggregation: boolean }
  ): Promise<LineChartData[]> {
    console.log(`[SafetyTransformer] Processing ${responses.length} responses`);
    console.log(`[SafetyTransformer] Time period:`, timePeriod);
    
    if (!this.canTransform(responses)) {
      console.log(`[SafetyTransformer] Cannot transform responses - missing safety-incidents-count`);
      return [];
    }

    // Find the incident count field dynamically
    const incidentField = this.findIncidentCountField(responses);
    if (!incidentField) {
      console.log(`[SafetyTransformer] No incident count field found`);
      return [];
    }
    
    // Extract incident count values and convert to numbers
    const valueExtractor = (response: PillarResponse): number => {
      const incidentCount = response.responses[incidentField];
      const numValue = this.convertIncidentCountToNumber(incidentCount);
      console.log(`[SafetyTransformer] Date: ${response.responseDate}, field: ${incidentField}, incidents: ${incidentCount} -> ${numValue}`);
      return numValue;
    };

    // Choose aggregation method based on time period
    let chartData: LineChartData[];
    
    if (timePeriod?.useDailyAggregation) {
      console.log(`[SafetyTransformer] Using daily aggregation for ${timePeriod.days} days`);
      // Use daily aggregation for shorter periods
      chartData = aggregationUtils.aggregateToDaily(responses, valueExtractor, timePeriod.days);
    } else {
      console.log(`[SafetyTransformer] Using monthly aggregation`);
      // Use monthly aggregation for longer periods
      const months = timePeriod ? Math.ceil(timePeriod.days / 30) : 5;
      chartData = aggregationUtils.aggregateToMonthly(responses, valueExtractor, months);
    }

    console.log(`[SafetyTransformer] Generated ${chartData.length} chart data points:`, chartData);

    // Apply target values (safety target is always 0 incidents)
    return chartData.map(item => ({
      ...item,
      target: 0 // Safety target is always zero incidents
    }));
  }

  /**
   * Transform safety responses into pie chart format (incident level distribution)
   */
  async transformToPieChart(responses: PillarResponse[]): Promise<DonutData[]> {
    if (!this.canTransform(responses)) {
      return [];
    }
    
    // Find the incident count field dynamically
    const incidentField = this.findIncidentCountField(responses);
    if (!incidentField) {
      console.log(`[SafetyTransformer] No incident count field found for pie chart`);
      return [];
    }

    // Count incident levels
    const incidentLevelCounts = new Map<string, number>();
    
    responses.forEach(response => {
      const incidentCount = response.responses[incidentField];
      if (incidentCount !== undefined) {
        const level = this.getIncidentLevel(incidentCount);
        incidentLevelCounts.set(level, (incidentLevelCounts.get(level) || 0) + 1);
      }
    });

    // Convert to DonutData format with appropriate colors
    const colorMap = {
      'No Incidents': '#22c55e',     // Green for no incidents
      'Single Incident': '#eab308',   // Yellow for single incident  
      'Multiple Incidents': '#ef4444' // Red for multiple incidents
    };

    return Array.from(incidentLevelCounts.entries())
      .map(([level, count]) => ({
        name: level,
        value: count,
        color: colorMap[level as keyof typeof colorMap] || '#6b7280'
      }))
      .sort((a, b) => {
        // Sort by severity: No Incidents -> Single -> Multiple
        const order = ['No Incidents', 'Single Incident', 'Multiple Incidents'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
  }

  /**
   * Convert incident count response to numeric value
   */
  private convertIncidentCountToNumber(incidentCount: string | number | boolean | string[]): number {
    if (typeof incidentCount === 'number') {
      return incidentCount;
    }
    
    if (typeof incidentCount === 'string') {
      const cleaned = incidentCount.trim().toLowerCase();
      
      // Handle legacy "2 or more" format
      if (cleaned === '2 or more') {
        return 2;
      }
      
      // Handle "10 or more" format
      if (cleaned === '10 or more') {
        return 10;
      }
      
      // Try to parse as regular number (0, 1, 2, 3, etc.)
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Default to 0 for any other type
    return 0;
  }

  /**
   * Convert incident count to descriptive level for pie chart
   */
  private getIncidentLevel(incidentCount: string | number | boolean | string[]): string {
    const numericCount = this.convertIncidentCountToNumber(incidentCount);
    
    switch (numericCount) {
      case 0: {
        return 'No Incidents';
      }
      case 1: {
        return 'Single Incident';
      }
      default: {
        return 'Multiple Incidents';
      }
    }
  }

  /**
   * Get the value extractor function for safety incident count
   */
  getValueExtractor(): (response: PillarResponse) => number {
    return (response: PillarResponse): number => {
      // Try to find incident count field dynamically
      const possibleFieldNames = [
        'safety-incidents-count',
        'incidents-count', 
        'incident-count',
        'incidents',
        'safety-incidents',
        'incidentCount',
        'safetyIncidents'
      ];
      
      let incidentCount: any = 0;
      for (const fieldName of possibleFieldNames) {
        if (response.responses[fieldName] !== undefined) {
          incidentCount = response.responses[fieldName];
          break;
        }
      }
      
      return this.convertIncidentCountToNumber(incidentCount);
    };
  }

  /**
   * Get additional metrics for safety dashboard
   */
  async getAdditionalMetrics(responses: PillarResponse[]): Promise<{
    totalIncidents: number;
    incidentFreeDays: number;
    averageIncidentsPerMonth: number;
    worstDay: { date: string; incidents: number } | null;
  }> {
    if (!this.canTransform(responses)) {
      return {
        totalIncidents: 0,
        incidentFreeDays: 0,
        averageIncidentsPerMonth: 0,
        worstDay: null
      };
    }

    let totalIncidents = 0;
    let incidentFreeDays = 0;
    let worstDay: { date: string; incidents: number } | null = null;

    // Find the incident count field dynamically
    const incidentField = this.findIncidentCountField(responses);
    if (!incidentField) {
      return {
        totalIncidents: 0,
        incidentFreeDays: 0,
        averageIncidentsPerMonth: 0,
        worstDay: null
      };
    }
    
    responses.forEach(response => {
      const incidents = this.convertIncidentCountToNumber(response.responses[incidentField]);
      totalIncidents += incidents;
      
      if (incidents === 0) {
        incidentFreeDays++;
      }
      
      if (!worstDay || incidents > worstDay.incidents) {
        worstDay = {
          date: response.responseDate,
          incidents
        };
      }
    });

    // Calculate average incidents per month
    const uniqueMonths = new Set(
      responses.map(r => {
        const date = new Date(r.responseDate);
        return `${date.getFullYear()}-${date.getMonth()}`;
      })
    );

    const averageIncidentsPerMonth = uniqueMonths.size > 0 
      ? Math.round((totalIncidents / uniqueMonths.size) * 100) / 100
      : 0;

    return {
      totalIncidents,
      incidentFreeDays,
      averageIncidentsPerMonth,
      worstDay: worstDay?.incidents === 0 ? null : worstDay
    };
  }
}
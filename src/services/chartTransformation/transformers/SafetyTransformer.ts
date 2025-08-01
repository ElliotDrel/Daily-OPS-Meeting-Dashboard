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
            return fieldName;
          }
        }
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
    if (!this.canTransform(responses)) {
      return [];
    }

    // Find the incident count field dynamically
    const incidentField = this.findIncidentCountField(responses);
    if (!incidentField) {
      return [];
    }
    
    // Extract incident count values and convert to numbers
    const valueExtractor = (response: PillarResponse): number => {
      const incidentCount = response.responses[incidentField];
      const numValue = this.convertIncidentCountToNumber(incidentCount);
      return numValue;
    };

    // Choose aggregation method based on time period
    let chartData: LineChartData[];
    
    if (timePeriod?.useDailyAggregation) {
      // Use daily aggregation for shorter periods
      chartData = aggregationUtils.aggregateToDaily(responses, valueExtractor, timePeriod.days);
    } else {
      // Use monthly aggregation for longer periods
      const months = timePeriod ? Math.ceil(timePeriod.days / 30) : 5;
      chartData = aggregationUtils.aggregateToMonthly(responses, valueExtractor, months);
    }

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
   * Transform safety responses into pie chart format showing incident types by description
   */
  async transformToIncidentTypesPieChart(
    responses: PillarResponse[], 
    timePeriod?: { days: number; useDailyAggregation: boolean }
  ): Promise<DonutData[]> {
    if (!this.canTransform(responses)) {
      console.log(`[SafetyTransformer] Cannot transform responses for incident types pie chart`);
      return [];
    }

    // Filter responses by time period if provided
    let filteredResponses = responses;
    if (timePeriod) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timePeriod.days);
      filteredResponses = responses.filter(response => {
        const responseDate = new Date(response.responseDate);
        return responseDate >= cutoffDate;
      });
      console.log(`[SafetyTransformer] Filtered to ${filteredResponses.length} responses within ${timePeriod.days} days`);
    }

    // Track incident descriptions with count and earliest occurrence
    const incidentTracker = new Map<string, {
      count: number;
      firstOccurrenceDate: string;
    }>();

    // Extract all incident descriptions from filtered responses
    filteredResponses.forEach(response => {
      const descriptions = this.extractIncidentDescriptions(response.responses);
      descriptions.forEach(description => {
        const existing = incidentTracker.get(description);
        if (existing) {
          existing.count++;
          // Keep earliest occurrence date for color assignment consistency
          if (response.responseDate < existing.firstOccurrenceDate) {
            existing.firstOccurrenceDate = response.responseDate;
          }
        } else {
          incidentTracker.set(description, {
            count: 1,
            firstOccurrenceDate: response.responseDate
          });
        }
      });
    });

    // If no incidents found, return empty array
    if (incidentTracker.size === 0) {
      console.log(`[SafetyTransformer] No incident descriptions found in responses`);
      return [];
    }

    // Convert to array and sort by earliest occurrence date for consistent color assignment
    const sortedIncidents = Array.from(incidentTracker.entries())
      .sort((a, b) => {
        // Sort by earliest occurrence date (ascending)
        return new Date(a[1].firstOccurrenceDate).getTime() - new Date(b[1].firstOccurrenceDate).getTime();
      });

    // Define color palette for incident types
    const colorPalette = [
      '#ef4444', // Red
      '#f97316', // Orange  
      '#eab308', // Yellow
      '#22c55e', // Green
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#6366f1', // Indigo
      '#84cc16', // Lime
    ];

    // Create DonutData with color assignment
    const result = sortedIncidents.map(([description, data], index) => ({
      name: description,
      value: data.count,
      color: colorPalette[index % colorPalette.length]
    }));

    console.log(`[SafetyTransformer] Generated ${result.length} incident type categories:`, result);
    return result;
  }

  /**
   * Extract incident descriptions from response JSONB data
   */
  private extractIncidentDescriptions(responseJson: Record<string, unknown>): string[] {
    const descriptions: string[] = [];
    const incidentCount = this.convertIncidentCountToNumber(responseJson['safety-incidents-count'] || '0');
    
    // Only look for descriptions if count > 0
    if (incidentCount > 0) {
      for (let i = 1; i <= incidentCount; i++) {
        const fieldName = `safety-incident-${i}-description`;
        const description = responseJson[fieldName];
        
        if (description && typeof description === 'string' && description.trim()) {
          descriptions.push(description.trim());
        }
      }
    }
    
    return descriptions;
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
      
      let incidentCount: string | number | boolean | string[] = 0;
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
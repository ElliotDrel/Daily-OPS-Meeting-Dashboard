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
   * Check if this transformer can handle the given responses
   */
  canTransform(responses: PillarResponse[]): boolean {
    if (responses.length === 0) return false;
    
    // Check if responses contain safety incident count data
    return responses.some(response => 
      response.pillar === 'safety' && 
      response.responses['safety-incidents-count'] !== undefined
    );
  }

  /**
   * Transform safety responses into line chart format (monthly incident trends)
   */
  async transformToLineChart(
    responses: PillarResponse[], 
    config: ChartTargetConfig
  ): Promise<LineChartData[]> {
    if (!this.canTransform(responses)) {
      return [];
    }

    // Extract incident count values and convert to numbers
    const valueExtractor = (response: PillarResponse): number => {
      const incidentCount = response.responses['safety-incidents-count'];
      return this.convertIncidentCountToNumber(incidentCount);
    };

    // Use aggregation utility to create monthly data
    const monthlyData = aggregationUtils.aggregateToMonthly(responses, valueExtractor);

    // Apply target values (safety target is always 0 incidents)
    return monthlyData.map(item => ({
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

    // Count incident levels
    const incidentLevelCounts = new Map<string, number>();
    
    responses.forEach(response => {
      const incidentCount = response.responses['safety-incidents-count'];
      if (incidentCount) {
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
      
      switch (cleaned) {
        case '0': {
          return 0;
        }
        case '1': {
          return 1;
        }
        case '2 or more': {
          return 2; // Use 2 as representative value for "2 or more"
        }
        default: {
          // Try to parse as number if it's a different format
          const parsed = parseInt(cleaned, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
      }
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

    responses.forEach(response => {
      const incidents = this.convertIncidentCountToNumber(response.responses['safety-incidents-count']);
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
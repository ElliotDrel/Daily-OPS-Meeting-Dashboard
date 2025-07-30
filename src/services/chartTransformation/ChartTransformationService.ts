// Chart Transformation Service - Main service for converting collected data to chart format
// Coordinates pillar transformers and handles caching for optimal performance

import { supabase } from '@/lib/supabase';
import { PillarResponse } from '@/types/dataCollection';
import { 
  ChartTransformationService as IChartTransformationService,
  PillarTransformer,
  PillarName,
  LineChartData,
  DonutData,
  CacheEntry,
  ChartTransformationError,
  InsufficientDataError,
  DEFAULT_CONFIG,
  DEFAULT_TARGETS,
  CACHE_CONFIG
} from './types';
import { validationUtils, dateUtils } from './aggregationUtils';
import { strategyFactory } from './timePeriodStrategies';

class ChartTransformationService implements IChartTransformationService {
  private transformers = new Map<PillarName, PillarTransformer>();
  private lineChartCache = new Map<string, CacheEntry<LineChartData[]>>();
  private pieChartCache = new Map<string, CacheEntry<DonutData[]>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCacheCleanup();
  }

  /**
   * Register a pillar transformer
   */
  registerTransformer(transformer: PillarTransformer): void {
    this.transformers.set(transformer.getPillarName(), transformer);
  }

  /**
   * Get line chart data for a pillar with caching
   */
  async getLineChartData(pillar: PillarName, months: number = DEFAULT_CONFIG.monthsToAnalyze): Promise<LineChartData[]> {
    const cacheKey = `${pillar}-line-${months}`;
    
    // Check cache first
    const cached = this.lineChartCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      // Get responses from database
      const responses = await this.getResponsesForPillar(pillar, months * 30);
      
      // Check if we have sufficient data
      if (responses.length < DEFAULT_CONFIG.minDataPointsForLine) {
        throw new InsufficientDataError(
          pillar, 
          'line', 
          responses.length, 
          DEFAULT_CONFIG.minDataPointsForLine
        );
      }

      // Get transformer and transform data
      const transformer = this.transformers.get(pillar);
      if (!transformer) {
        throw new ChartTransformationError(`No transformer registered for pillar: ${pillar}`, pillar, 'line');
      }

      // Determine aggregation method based on time period
      // Use daily aggregation for periods of 30 days or less
      const totalDays = months * 30;
      const useDailyAggregation = totalDays <= 30;
      
      const timePeriod = {
        days: totalDays,
        useDailyAggregation
      };

      let chartData = await transformer.transformToLineChart(responses, DEFAULT_TARGETS, timePeriod);
      
      // Apply targets to chart data
      chartData = this.applyTargetsToLineChart(chartData, pillar);

      // Cache the result
      this.lineChartCache.set(cacheKey, {
        data: chartData,
        timestamp: Date.now(),
        pillar,
        parameters: cacheKey
      });

      return chartData;

    } catch (error) {
      if (error instanceof InsufficientDataError) {
        // Return empty array for insufficient data - caller should handle fallback
        return [];
      }
      
      throw new ChartTransformationError(
        `Failed to get line chart data for ${pillar}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pillar,
        'line',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get line chart data for a pillar using time period strategies
   */
  async getLineChartDataWithStrategy(pillar: PillarName, strategyName: string = 'month'): Promise<LineChartData[]> {
    const cacheKey = `${pillar}-strategy-${strategyName}`;
    
    // Check cache first
    const cached = this.lineChartCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      // Get the strategy
      const strategy = strategyFactory.getStrategy(strategyName);
      if (!strategy) {
        throw new ChartTransformationError(`Strategy not found: ${strategyName}`, pillar, 'line');
      }

      // Get the transformer for value extraction
      const transformer = this.transformers.get(pillar);
      if (!transformer) {
        throw new ChartTransformationError(`No transformer registered for pillar: ${pillar}`, pillar, 'line');
      }

      // Calculate date range for data fetching
      const dateRange = strategy.calculateDateRange();
      const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Get responses from database
      const responses = await this.getResponsesForPillar(pillar, daysDiff + 5); // Add buffer for timezone/edge cases

      // Check if we have sufficient data
      if (responses.length < DEFAULT_CONFIG.minDataPointsForLine) {
        throw new InsufficientDataError(
          pillar, 
          'line', 
          responses.length, 
          DEFAULT_CONFIG.minDataPointsForLine
        );
      }

      // Use strategy to aggregate data
      const valueExtractor = transformer.getValueExtractor();
      let chartData = strategy.aggregateToChartData(responses, valueExtractor);

      // Apply targets to chart data using pillar-specific configuration
      chartData = this.applyTargetsToLineChart(chartData, pillar);

      // Cache the result
      this.lineChartCache.set(cacheKey, {
        data: chartData,
        timestamp: Date.now(),
        pillar,
        parameters: cacheKey
      });

      return chartData;

    } catch (error) {
      if (error instanceof InsufficientDataError) {
        // Return empty array for insufficient data - caller should handle fallback
        return [];
      }
      
      throw new ChartTransformationError(
        `Failed to get line chart data with strategy for ${pillar}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pillar,
        'line',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get pie chart data for a pillar with caching
   */
  async getPieChartData(pillar: PillarName, days: number = 30): Promise<DonutData[]> {
    const cacheKey = `${pillar}-pie-${days}`;
    
    // Check cache first
    const cached = this.pieChartCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      // Get responses from database
      const responses = await this.getResponsesForPillar(pillar, days);
      
      // Check if we have sufficient data
      if (responses.length < DEFAULT_CONFIG.minDataPointsForPie) {
        throw new InsufficientDataError(
          pillar, 
          'pie', 
          responses.length, 
          DEFAULT_CONFIG.minDataPointsForPie
        );
      }

      // Get transformer and transform data
      const transformer = this.transformers.get(pillar);
      if (!transformer) {
        throw new ChartTransformationError(`No transformer registered for pillar: ${pillar}`, pillar, 'pie');
      }

      const chartData = await transformer.transformToPieChart(responses);

      // Cache the result
      this.pieChartCache.set(cacheKey, {
        data: chartData,
        timestamp: Date.now(),
        pillar,
        parameters: cacheKey
      });

      return chartData;

    } catch (error) {
      if (error instanceof InsufficientDataError) {
        // Return empty array for insufficient data - caller should handle fallback
        return [];
      }
      
      throw new ChartTransformationError(
        `Failed to get pie chart data for ${pillar}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pillar,
        'pie',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Check if we have sufficient data for accurate charts
   */
  async hasSufficientData(pillar: PillarName, chartType: 'line' | 'pie'): Promise<boolean> {
    try {
      const days = chartType === 'line' ? DEFAULT_CONFIG.monthsToAnalyze * 30 : 30;
      const responses = await this.getResponsesForPillar(pillar, days);
      
      const minRequired = chartType === 'line' 
        ? DEFAULT_CONFIG.minDataPointsForLine 
        : DEFAULT_CONFIG.minDataPointsForPie;

      return responses.length >= minRequired;
    } catch (error) {
      console.error(`Error checking data sufficiency for ${pillar}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cached data for a pillar
   */
  invalidateCache(pillar: PillarName): void {
    // Remove all cache entries for this pillar
    for (const [key, entry] of this.lineChartCache.entries()) {
      if (entry.pillar === pillar) {
        this.lineChartCache.delete(key);
      }
    }
    
    for (const [key, entry] of this.pieChartCache.entries()) {
      if (entry.pillar === pillar) {
        this.pieChartCache.delete(key);
      }
    }
  }

  /**
   * Get comprehensive data status for a pillar
   */
  async getDataStatus(pillar: PillarName): Promise<{
    hasLineData: boolean;
    hasPieData: boolean;
    dataPointsCount: number;
    oldestDataDate: string | null;
    newestDataDate: string | null;
  }> {
    try {
      const responses = await this.getResponsesForPillar(pillar, DEFAULT_CONFIG.monthsToAnalyze * 30);
      const dateRange = dateUtils.getDateRange(responses);
      
      return {
        hasLineData: responses.length >= DEFAULT_CONFIG.minDataPointsForLine,
        hasPieData: responses.length >= DEFAULT_CONFIG.minDataPointsForPie,
        dataPointsCount: responses.length,
        oldestDataDate: dateRange.oldest,
        newestDataDate: dateRange.newest
      };
    } catch (error) {
      console.error(`Error getting data status for ${pillar}:`, error);
      return {
        hasLineData: false,
        hasPieData: false,
        dataPointsCount: 0,
        oldestDataDate: null,
        newestDataDate: null
      };
    }
  }

  /**
   * Get responses for a pillar from the database
   */
  private async getResponsesForPillar(pillar: PillarName, days: number): Promise<PillarResponse[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    console.log(`[ChartTransformationService] Fetching ${pillar} responses for last ${days} days`);
    console.log(`[ChartTransformationService] Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
    
    const { data, error } = await supabase
      .from('pillar_responses')
      .select('*')
      .eq('pillar', pillar)
      .gte('response_date', cutoffDate.toISOString().split('T')[0])
      .order('response_date', { ascending: true });

    if (error) {
      throw new Error(`Database error fetching ${pillar} responses: ${error.message}`);
    }

    console.log(`[ChartTransformationService] Found ${(data || []).length} responses from database`);
    if (data && data.length > 0) {
      console.log(`[ChartTransformationService] Sample response:`, data[0]);
    }

    // Transform database format to app format
    return (data || []).map(dbResponse => ({
      id: dbResponse.id,
      userId: dbResponse.user_id,
      pillar: dbResponse.pillar,
      responseDate: dbResponse.response_date,
      responses: dbResponse.responses,
      createdAt: dbResponse.created_at,
      updatedAt: dbResponse.updated_at
    }));
  }

  /**
   * Apply target values to line chart data based on configuration
   */
  private applyTargetsToLineChart(chartData: LineChartData[], pillar: PillarName): LineChartData[] {
    const pillarConfig = DEFAULT_TARGETS[pillar];
    if (!pillarConfig) {
      return chartData;
    }

    let targetValue = 0;
    
    if (pillarConfig.lineChartTarget !== undefined) {
      // Use static target
      targetValue = pillarConfig.lineChartTarget;
    } else if (pillarConfig.adaptiveTarget) {
      // Calculate adaptive target from the data
      const values = chartData.map(d => d.value).filter(v => v > 0);
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        targetValue = Math.round((sum / values.length) * 1.1 * 100) / 100; // 10% above average
      }
    }

    return chartData.map(item => ({
      ...item,
      target: targetValue
    }));
  }

  /**
   * Check if a cache entry is still valid
   */
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    const age = Date.now() - entry.timestamp;
    return age < (CACHE_CONFIG.TTL_MINUTES * 60 * 1000);
  }

  /**
   * Start periodic cache cleanup
   */
  private startCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCache();
    }, CACHE_CONFIG.CLEANUP_INTERVAL_MINUTES * 60 * 1000);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const ttlMs = CACHE_CONFIG.TTL_MINUTES * 60 * 1000;

    // Clean line chart cache
    for (const [key, entry] of this.lineChartCache.entries()) {
      if (now - entry.timestamp > ttlMs) {
        this.lineChartCache.delete(key);
      }
    }

    // Clean pie chart cache
    for (const [key, entry] of this.pieChartCache.entries()) {
      if (now - entry.timestamp > ttlMs) {
        this.pieChartCache.delete(key);
      }
    }

    // Enforce max entries limit
    if (this.lineChartCache.size > CACHE_CONFIG.MAX_ENTRIES) {
      const entries = Array.from(this.lineChartCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toDelete = entries.slice(0, entries.length - CACHE_CONFIG.MAX_ENTRIES);
      toDelete.forEach(([key]) => this.lineChartCache.delete(key));
    }

    if (this.pieChartCache.size > CACHE_CONFIG.MAX_ENTRIES) {
      const entries = Array.from(this.pieChartCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toDelete = entries.slice(0, entries.length - CACHE_CONFIG.MAX_ENTRIES);
      toDelete.forEach(([key]) => this.pieChartCache.delete(key));
    }
  }

  /**
   * Cleanup resources when service is destroyed
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.lineChartCache.clear();
    this.pieChartCache.clear();
    this.transformers.clear();
  }
}

// Export singleton instance
export const chartTransformationService = new ChartTransformationService();
export { ChartTransformationService };
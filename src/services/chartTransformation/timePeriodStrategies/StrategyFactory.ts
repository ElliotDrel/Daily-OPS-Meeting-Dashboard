// Time Period Strategy Factory
// Central registry and factory for all time period strategies

import { TimePeriodStrategy, TimePeriodStrategyFactory, StrategyName } from './types';
import { WeekStrategy } from './WeekStrategy';
import { MonthStrategy } from './MonthStrategy';
import { ThreeMonthStrategy } from './ThreeMonthStrategy';
import { SixMonthStrategy } from './SixMonthStrategy';

export class StrategyFactory implements TimePeriodStrategyFactory {
  private static instance: StrategyFactory;
  private strategies = new Map<string, TimePeriodStrategy>();
  
  private constructor() {
    this.initializeStrategies();
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): StrategyFactory {
    if (!StrategyFactory.instance) {
      StrategyFactory.instance = new StrategyFactory();
    }
    return StrategyFactory.instance;
  }
  
  /**
   * Initialize all default strategies
   */
  private initializeStrategies(): void {
    const defaultStrategies = [
      new WeekStrategy(),
      new MonthStrategy(), 
      new ThreeMonthStrategy(),
      new SixMonthStrategy()
    ];
    
    defaultStrategies.forEach(strategy => {
      this.registerStrategy(strategy);
    });
    
    console.log(`[StrategyFactory] Initialized ${defaultStrategies.length} strategies`);
  }
  
  /**
   * Get a strategy instance by name
   */
  getStrategy(strategyName: string): TimePeriodStrategy | null {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      console.warn(`[StrategyFactory] Strategy not found: ${strategyName}`);
      return null;
    }
    return strategy;
  }
  
  /**
   * Get all available strategies
   */
  getAllStrategies(): TimePeriodStrategy[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Register a new strategy
   */
  registerStrategy(strategy: TimePeriodStrategy): void {
    const name = strategy.getStrategyName();
    if (this.strategies.has(name)) {
      console.warn(`[StrategyFactory] Overwriting existing strategy: ${name}`);
    }
    
    this.strategies.set(name, strategy);
    console.log(`[StrategyFactory] Registered strategy: ${name}`);
  }
  
  /**
   * Get strategy names mapped to their display information
   */
  getStrategyOptions(): Array<{ value: string; label: string; description: string }> {
    return Array.from(this.strategies.values()).map(strategy => ({
      value: strategy.getStrategyName(),
      ...strategy.getDisplayInfo()
    }));
  }
  
  /**
   * Check if a strategy exists
   */
  hasStrategy(strategyName: string): boolean {
    return this.strategies.has(strategyName);
  }
  
  /**
   * Get default strategy (week strategy)
   */
  getDefaultStrategy(): TimePeriodStrategy {
    const defaultStrategy = this.getStrategy('week');
    if (!defaultStrategy) {
      throw new Error('Default strategy (week) not found');
    }
    return defaultStrategy;
  }
  
  /**
   * Map old time period values to new strategy names
   */
  mapLegacyPeriodToStrategy(legacyPeriod: string): string {
    const mapping: Record<string, string> = {
      '1w': 'week',
      '1m': 'month', 
      '3m': '3month',
      '6m': '6month'
    };
    
    return mapping[legacyPeriod] || 'week';
  }
}

// Export singleton instance for convenience
export const strategyFactory = StrategyFactory.getInstance();
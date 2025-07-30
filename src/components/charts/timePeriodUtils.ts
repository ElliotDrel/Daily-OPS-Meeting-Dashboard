import { strategyFactory } from "@/services/chartTransformation/timePeriodStrategies";

export interface TimePeriodOption {
  label: string;
  value: string;
  description: string;
}

// Get time period options from strategy factory
export const getTimePeriodOptions = (): TimePeriodOption[] => {
  return strategyFactory.getStrategyOptions().map(option => ({
    label: option.label,
    value: option.value,
    description: option.description
  }));
};

// Legacy options for backward compatibility (maps old values to new strategy names)
export const LEGACY_TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { label: "1 Week", value: "week", description: "Work week around today (daily view)" },
  { label: "1 Month", value: "month", description: "Current month broken into weeks" },
  { label: "3 Months", value: "3month", description: "Last 3 months with monthly totals" },
  { label: "6 Months", value: "6month", description: "Last 6 months with monthly totals" },
];

export const getTimePeriodConfig = (periodValue: string): TimePeriodOption => {
  const options = getTimePeriodOptions();
  const option = options.find(opt => opt.value === periodValue);
  return option || options.find(opt => opt.value === 'month') || options[0]; // Default to month or first option
};

// Legacy function to map old period values to new strategy names
export const mapLegacyPeriod = (legacyPeriod: string): string => {
  const mapping: Record<string, string> = {
    '1w': 'week',
    '1m': 'month', 
    '3m': '3month',
    '6m': '6month',
    '5m': 'month' // Common fallback case
  };
  
  return mapping[legacyPeriod] || legacyPeriod;
};

// Check if a period value is in legacy format
export const isLegacyPeriod = (period: string): boolean => {
  return ['1w', '1m', '3m', '6m', '5m'].includes(period);
};
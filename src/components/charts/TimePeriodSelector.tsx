import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface TimePeriodOption {
  label: string;
  value: string;
  days: number;
  months: number;
}

export const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { label: "1 Week", value: "1w", days: 7, months: 0.25 },
  { label: "1 Month", value: "1m", days: 30, months: 1 },
  { label: "3 Months", value: "3m", days: 90, months: 3 },
  { label: "6 Months", value: "6m", days: 180, months: 6 },
];

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  className?: string;
  showLabel?: boolean;
}

export const TimePeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  className = "",
  showLabel = true
}: TimePeriodSelectorProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
      )}
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {TIME_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getTimePeriodConfig = (periodValue: string): TimePeriodOption => {
  const option = TIME_PERIOD_OPTIONS.find(opt => opt.value === periodValue);
  return option || TIME_PERIOD_OPTIONS[1]; // Default to 1 month
};
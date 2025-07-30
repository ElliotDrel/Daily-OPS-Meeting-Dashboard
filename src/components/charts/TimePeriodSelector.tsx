import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getTimePeriodOptions, 
  isLegacyPeriod, 
  mapLegacyPeriod,
  type TimePeriodOption 
} from "./timePeriodUtils";

// Re-export utilities for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export {
  getTimePeriodOptions,
  getTimePeriodConfig, 
  mapLegacyPeriod,
  isLegacyPeriod,
  LEGACY_TIME_PERIOD_OPTIONS,
  type TimePeriodOption
} from "./timePeriodUtils";

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
  // Get dynamic options from strategy factory
  const options = getTimePeriodOptions();
  
  // Auto-migrate legacy period values
  useEffect(() => {
    if (isLegacyPeriod(selectedPeriod)) {
      const migratedPeriod = mapLegacyPeriod(selectedPeriod);
      onPeriodChange(migratedPeriod);
    }
  }, [selectedPeriod, onPeriodChange]);
  
  // Use migrated period for display
  const displayPeriod = isLegacyPeriod(selectedPeriod) ? mapLegacyPeriod(selectedPeriod) : selectedPeriod;
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
      )}
      <Select value={displayPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
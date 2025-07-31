// Smart Incident Dropdown - Dropdown with historical incident data and "Other Incident" option
// Integrates with incident history service and provides conditional text input

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useIncidentHistoryForField } from '@/hooks/useIncidentHistory';
import { IncidentTextInput } from './IncidentTextInput';
import { 
  OTHER_INCIDENT_OPTION,
  INCIDENT_DROPDOWN_MAX_HEIGHT,
  VALIDATION_MESSAGES 
} from '@/constants/incidentConfiguration';
import { cn } from '@/lib/utils';

interface SmartIncidentDropdownProps {
  questionId: string;
  pillar: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  userId?: string;
}

export const SmartIncidentDropdown = ({
  questionId,
  pillar,
  value,
  onChange,
  error,
  required = false,
  userId = 'default-user'
}: SmartIncidentDropdownProps) => {
  
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherIncidentText, setOtherIncidentText] = useState('');
  
  // Get incident history data
  const {
    allOptions,
    isLoading,
    error: historyError,
    hasHistoricalData,
    isIncidentField,
    incidentNumber
  } = useIncidentHistoryForField(pillar, questionId, userId);

  // Initialize state based on current value
  useEffect(() => {
    if (!value) {
      setIsOtherSelected(false);
      setOtherIncidentText('');
      return;
    }

    // If value is exactly "Other Incident", set to other mode with no text
    if (value === OTHER_INCIDENT_OPTION) {
      setIsOtherSelected(true);
      setOtherIncidentText('');
      return;
    }

    // Check if current value matches any historical option
    const matchesHistorical = allOptions.some(option => 
      option.value === value && option.value !== OTHER_INCIDENT_OPTION
    );

    if (matchesHistorical) {
      setIsOtherSelected(false);
      setOtherIncidentText('');
    } else if (value.trim()) {
      // Current value is custom text (either from editing or new entry)
      setIsOtherSelected(true);
      setOtherIncidentText(value);
    }
  }, [value, allOptions]);

  // Handle dropdown selection change
  const handleDropdownChange = (selectedValue: string) => {
    if (selectedValue === OTHER_INCIDENT_OPTION) {
      setIsOtherSelected(true);
      setOtherIncidentText('');
      // Call onChange with the OTHER_INCIDENT_OPTION value to maintain state
      onChange(OTHER_INCIDENT_OPTION);
    } else {
      setIsOtherSelected(false);
      setOtherIncidentText('');
      onChange(selectedValue);
    }
  };

  // Handle text input change for "Other Incident"
  const handleTextInputChange = (text: string) => {
    setOtherIncidentText(text);
    onChange(text);
  };

  // Don't render if this isn't an incident field
  if (!isIncidentField) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading incident history...</span>
      </div>
    );
  }

  // Error state
  if (historyError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {historyError}
        </AlertDescription>
      </Alert>
    );
  }

  // Determine dropdown value for display
  const dropdownValue = isOtherSelected ? OTHER_INCIDENT_OPTION : (value || '');

  return (
    <div className="space-y-3">
      {/* Dropdown */}
      <Select 
        value={dropdownValue} 
        onValueChange={handleDropdownChange}
      >
        <SelectTrigger 
          id={questionId}
          className={cn(
            error && 'border-destructive',
            'w-full'
          )}
          aria-describedby={error ? `${questionId}-error` : undefined}
        >
          <SelectValue 
            placeholder={hasHistoricalData ? "Select incident or choose other" : "Select other incident"} 
          />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[200px] overflow-y-auto"
          style={{ maxHeight: INCIDENT_DROPDOWN_MAX_HEIGHT }}
        >
          {/* Historical incidents */}
          {allOptions
            .filter(option => option.value !== OTHER_INCIDENT_OPTION)
            .map((option, index) => (
              <SelectItem key={`${option.value}-${index}`} value={option.value}>
                <span title={option.value}>
                  {option.displayText}
                </span>
              </SelectItem>
            ))}
          
          {/* Separator if we have historical options */}
          {hasHistoricalData && (
            <div className="border-t my-1" />
          )}
          
          {/* "Other Incident" option */}
          <SelectItem value={OTHER_INCIDENT_OPTION}>
            {OTHER_INCIDENT_OPTION}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Conditional text input for "Other Incident" */}
      {isOtherSelected && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {VALIDATION_MESSAGES.CHAR_LIMIT_INSTRUCTION}
          </p>
          <IncidentTextInput
            questionId={`${questionId}-other`}
            value={otherIncidentText}
            onChange={handleTextInputChange}
            placeholder={`Incident ${incidentNumber || ''} description`.trim()}
            required={required}
            error={error}
          />
        </div>
      )}

      {/* No historical data message */}
      {!hasHistoricalData && !isLoading && (
        <p className="text-xs text-muted-foreground">
          No previous incidents recorded. This will be added to future options.
        </p>
      )}
    </div>
  );
};
// Incident Text Input - Specialized input for incident descriptions with character limits
// Provides real-time validation, character counter, and error feedback

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { validateIncidentText } from '@/services/incidentHistoryService';
import { 
  MAX_INCIDENT_CHARS,
  VALIDATION_MESSAGES,
  CHARACTER_COUNTER_UPDATE_DELAY 
} from '@/constants/incidentConfiguration';
import { cn } from '@/lib/utils';

interface IncidentTextInputProps {
  questionId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const IncidentTextInput = ({
  questionId,
  value,
  onChange,
  placeholder = 'Enter incident description',
  required = false,
  error,
  className
}: IncidentTextInputProps) => {
  
  const [showCharLimitError, setShowCharLimitError] = useState(false);
  const [validation, setValidation] = useState(validateIncidentText(value || ''));

  // Update validation when value changes
  useEffect(() => {
    const newValidation = validateIncidentText(value || '');
    setValidation(newValidation);
    
    // Show character limit error if over limit
    setShowCharLimitError(!newValidation.isValid && value.length > 0);
  }, [value]);

  // Handle input change with character limit enforcement
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Always allow typing, but provide feedback
    onChange(newValue);
  }, [onChange]);

  // Determine character counter color
  const getCharCounterColor = () => {
    if (!validation.isValid) return 'text-destructive';
    if (validation.charactersRemaining <= 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  // Determine if input should be highlighted
  const isOverLimit = !validation.isValid && value.length > 0;

  return (
    <div className="space-y-2">
      {/* Text Input */}
      <div className="relative">
        <Input
          id={questionId}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            isOverLimit && 'border-destructive bg-destructive/5',
            error && !isOverLimit && 'border-destructive',
            'pr-16', // Make room for character counter
            className
          )}
          aria-describedby={`${questionId}-char-count ${error ? `${questionId}-error` : ''}`}
          data-over-limit={isOverLimit}
        />
        
        {/* Character Counter - positioned in bottom right */}
        <div 
          id={`${questionId}-char-count`}
          className={cn(
            'absolute bottom-1 right-2 text-xs font-mono',
            getCharCounterColor()
          )}
          aria-live="polite"
        >
          {validation.charactersUsed}/{MAX_INCIDENT_CHARS}
        </div>
      </div>

      {/* Character limit error popup */}
      {showCharLimitError && (
        <Alert variant="destructive" className="animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {VALIDATION_MESSAGES.CHAR_LIMIT_EXCEEDED}
          </AlertDescription>
        </Alert>
      )}

      {/* Field validation error (separate from character limit) */}
      {error && !showCharLimitError && (
        <p id={`${questionId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Required field indicator */}
      {required && !value && (
        <p className="text-xs text-muted-foreground">
          This field is required
        </p>
      )}
    </div>
  );
};

// Export validation function for form-level validation
export const useIncidentTextValidation = (value: string) => {
  return validateIncidentText(value || '');
};
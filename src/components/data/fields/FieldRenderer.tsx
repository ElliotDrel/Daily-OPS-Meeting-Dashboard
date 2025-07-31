// Field Renderer - Renders appropriate field component based on question type
// Uses existing shadcn/ui components for consistency

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SmartIncidentDropdown } from './SmartIncidentDropdown';
import { PillarQuestion } from '@/types/dataCollection';
import { SMART_INCIDENT_FIELD_TYPE, INCIDENT_FIELD_PATTERN } from '@/constants/incidentConfiguration';
import { cn } from '@/lib/utils';

interface FieldRendererProps {
  question: PillarQuestion;
  value: string | number | boolean | string[];
  onChange: (value: string | number | boolean | string[]) => void;
  error?: string;
  pillar?: string; // Required for smart incident fields
}

export const FieldRenderer = ({ question, value, onChange, error, pillar }: FieldRendererProps) => {
  const renderField = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${question.text.toLowerCase()}`}
            className={cn(error && 'border-destructive')}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter a number"
            min="0"
            step="1"
            className={cn(error && 'border-destructive')}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );

      case 'textarea':
        // Check if this is an incident field - if so, use smart dropdown instead
        if (INCIDENT_FIELD_PATTERN.test(question.id)) {
          if (!pillar) {
            return (
              <div className="text-muted-foreground text-sm">
                Smart incident field requires pillar information
              </div>
            );
          }
          return (
            <SmartIncidentDropdown
              questionId={question.id}
              pillar={pillar}
              value={typeof value === 'string' ? value : ''}
              onChange={(newValue) => onChange(newValue)}
              error={error}
              required={question.required}
            />
          );
        }
        
        // Regular textarea for non-incident fields
        return (
          <Textarea
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${question.text.toLowerCase()}`}
            rows={3}
            className={cn(error && 'border-destructive')}
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger 
              id={question.id}
              className={cn(error && 'border-destructive')}
              aria-describedby={error ? `${question.id}-error` : undefined}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            className="flex flex-row space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`}>No</Label>
            </div>
          </RadioGroup>
        );

      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : [];
        
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${option}`}
                  className="text-sm font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      }

      case SMART_INCIDENT_FIELD_TYPE:
        if (!pillar) {
          return (
            <div className="text-muted-foreground text-sm">
              Smart incident field requires pillar information
            </div>
          );
        }
        return (
          <SmartIncidentDropdown
            questionId={question.id}
            pillar={pillar}
            value={typeof value === 'string' ? value : ''}
            onChange={(newValue) => onChange(newValue)}
            error={error}
            required={question.required}
          />
        );

      default:
        return (
          <div className="text-muted-foreground text-sm">
            Unsupported field type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-sm font-medium">
        {question.text}
        {question.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </Label>
      
      {renderField()}
      
      {error && (
        <p id={`${question.id}-error`} className="text-sm text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
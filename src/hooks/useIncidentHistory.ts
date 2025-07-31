// Incident History Hook - React hook for managing incident history data
// Integrates with TanStack Query for caching and state management

import { useQuery } from '@tanstack/react-query';
import { 
  getIncidentHistory, 
  IncidentExtractionResult, 
  IncidentOption 
} from '@/services/incidentHistoryService';
import { OTHER_INCIDENT_OPTION } from '@/constants/incidentConfiguration';

// Interface for the hook return value
export interface UseIncidentHistoryReturn {
  // Data
  options: IncidentOption[];
  allOptions: IncidentOption[]; // includes "Other Incident" option
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Helper functions
  hasHistoricalData: boolean;
  refresh: () => void;
}

// Hook for getting incident history for a specific pillar
export const useIncidentHistory = (
  pillar: string,
  userId: string = 'default-user'
): UseIncidentHistoryReturn => {
  
  // Query for incident history data
  const {
    data: result,
    isLoading,
    error: queryError,
    refetch
  } = useQuery<IncidentExtractionResult>({
    queryKey: ['incident-history', pillar, userId],
    queryFn: () => getIncidentHistory(pillar, userId),
    enabled: !!pillar, // Only run query if pillar is provided
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (shorter than questions since incident data changes more frequently)
    retry: 1, // Only retry once for incident history
  });

  // Extract options from query result
  const options = result?.options || [];
  const serviceError = result?.error;
  
  // Combine query error and service error
  const error = queryError ? 
    `Failed to load incident history: ${queryError.message}` :
    serviceError || null;

  // Create all options including "Other Incident"
  const allOptions: IncidentOption[] = [
    ...options,
    {
      value: OTHER_INCIDENT_OPTION,
      displayText: OTHER_INCIDENT_OPTION,
      lastUsed: '' // Always last in the list
    }
  ];

  // Helper computed values
  const hasHistoricalData = options.length > 0;

  // Refresh function
  const refresh = () => {
    refetch();
  };

  return {
    options,
    allOptions,
    isLoading,
    error,
    hasHistoricalData,
    refresh
  };
};

// Hook for getting incident history specifically for form fields
// This version is optimized for use in FieldRenderer components
export const useIncidentHistoryForField = (
  pillar: string,
  fieldId: string,
  userId: string = 'default-user'
): UseIncidentHistoryReturn & { 
  isIncidentField: boolean;
  incidentNumber: number | null;
} => {
  
  const baseHook = useIncidentHistory(pillar, userId);
  
  // Check if this field is an incident field
  const isIncidentField = fieldId.includes('-incident-') && fieldId.endsWith('-description');
  
  // Extract incident number from field ID
  const incidentNumberMatch = fieldId.match(/-incident-(\d+)-description$/);
  const incidentNumber = incidentNumberMatch ? parseInt(incidentNumberMatch[1], 10) : null;

  return {
    ...baseHook,
    isIncidentField,
    incidentNumber
  };
};
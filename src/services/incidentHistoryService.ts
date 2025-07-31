// Incident History Service - Extract and process historical incident data
// Leverages existing database queries to avoid performance impact

import { getResponsesForPillar } from './dataCollectionService';
import { PillarResponse } from '@/types/dataCollection';
import { 
  INCIDENT_FIELD_PATTERN, 
  MAX_INCIDENT_CHARS,
  VALIDATION_MESSAGES 
} from '@/constants/incidentConfiguration';

// Interface for processed incident data
export interface IncidentOption {
  value: string; // Full incident description
  displayText: string; // Truncated to MAX_INCIDENT_CHARS for display
  lastUsed: string; // ISO date string for sorting
}

// Interface for incident extraction result
export interface IncidentExtractionResult {
  options: IncidentOption[];
  error?: string;
}

// Extract incident descriptions from response JSON data
export const extractIncidentDescriptions = (
  responses: PillarResponse[]
): Map<string, string> => {
  const incidentMap = new Map<string, string>(); // description -> lastUsedDate

  responses.forEach(response => {
    const { responses: responseData, responseDate } = response;
    
    if (!responseData || typeof responseData !== 'object') {
      return;
    }

    // Extract incident fields using the pattern
    Object.entries(responseData).forEach(([key, value]) => {
      const match = key.match(INCIDENT_FIELD_PATTERN);
      
      if (match && typeof value === 'string' && value.trim()) {
        const description = value.trim();
        
        // Keep the most recent usage date for each incident
        if (!incidentMap.has(description) || 
            new Date(responseDate) > new Date(incidentMap.get(description)!)) {
          incidentMap.set(description, responseDate);
        }
      }
    });
  });

  return incidentMap;
};

// Process incident descriptions into dropdown options
export const processIncidentOptions = (
  incidentMap: Map<string, string>
): IncidentOption[] => {
  const options: IncidentOption[] = [];

  incidentMap.forEach((lastUsed, description) => {
    options.push({
      value: description,
      displayText: description.length > MAX_INCIDENT_CHARS 
        ? description.substring(0, MAX_INCIDENT_CHARS)
        : description,
      lastUsed
    });
  });

  // Sort by most recently used (descending)
  return options.sort((a, b) => 
    new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
  );
};

// Get historical incident options for a specific pillar
export const getIncidentHistory = async (
  pillar: string,
  userId: string = 'default-user'
): Promise<IncidentExtractionResult> => {
  try {
    // Use existing function to get all responses for the pillar
    const responses = await getResponsesForPillar(pillar, userId);
    
    if (!responses || responses.length === 0) {
      return {
        options: [],
        error: undefined // No error, just no data yet
      };
    }

    // Extract and process incident descriptions
    const incidentMap = extractIncidentDescriptions(responses);
    const options = processIncidentOptions(incidentMap);

    return {
      options,
      error: undefined
    };
  } catch (error) {
    return {
      options: [],
      error: VALIDATION_MESSAGES.NO_DATA_AVAILABLE
    };
  }
};

// Validate incident text against character limit
export const validateIncidentText = (text: string): {
  isValid: boolean;
  message?: string;
  charactersUsed: number;
  charactersRemaining: number;
} => {
  const charactersUsed = text.length;
  const charactersRemaining = MAX_INCIDENT_CHARS - charactersUsed;
  const isValid = charactersUsed <= MAX_INCIDENT_CHARS;

  return {
    isValid,
    message: isValid ? undefined : VALIDATION_MESSAGES.CHAR_LIMIT_EXCEEDED,
    charactersUsed,
    charactersRemaining
  };
};

// Check if a field is an incident description field
export const isIncidentField = (fieldId: string): boolean => {
  return INCIDENT_FIELD_PATTERN.test(fieldId);
};

// Get incident number from field ID (e.g., "safety-incident-2-description" -> 2)
export const getIncidentNumber = (fieldId: string): number | null => {
  const match = fieldId.match(INCIDENT_FIELD_PATTERN);
  return match ? parseInt(match[2], 10) : null;
};
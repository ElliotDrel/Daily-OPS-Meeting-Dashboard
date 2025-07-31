// Configuration constants for the smart incident dropdown system
// These values can be easily modified to adjust system behavior

// Character limits for incident descriptions
export const MAX_INCIDENT_CHARS = 30;

// Dropdown option text
export const OTHER_INCIDENT_OPTION = "Other Incident";

// Regular expression pattern to match incident description fields in JSON
// Matches: safety-incident-1-description, quality-incident-2-description, etc.
export const INCIDENT_FIELD_PATTERN = /^(\w+)-incident-(\d+)-description$/;

// UI configuration
export const INCIDENT_DROPDOWN_MAX_HEIGHT = 200; // pixels
export const CHARACTER_COUNTER_UPDATE_DELAY = 100; // milliseconds

// Validation messages
export const VALIDATION_MESSAGES = {
  CHAR_LIMIT_EXCEEDED: `You can only put ${MAX_INCIDENT_CHARS} characters max`,
  CHAR_LIMIT_INSTRUCTION: `Describe the incident clearly in ${MAX_INCIDENT_CHARS} characters or less`,
  FIELD_REQUIRED: 'This field is required',
  NO_DATA_AVAILABLE: 'No historical data available'
} as const;

// Field type for the new smart incident dropdown
export const SMART_INCIDENT_FIELD_TYPE = 'smart-incident-select';
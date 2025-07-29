// Chart Transformation Service - Main exports and initialization
// This file sets up the service and registers all pillar transformers

import { chartTransformationService } from './ChartTransformationService';
import { SafetyTransformer } from './transformers/SafetyTransformer';

// Import and register all transformers
const safetyTransformer = new SafetyTransformer();

// Register transformers with the main service
chartTransformationService.registerTransformer(safetyTransformer);

// Export the configured service instance
export { chartTransformationService };

// Export types and classes for use in other parts of the application
export type {
  ChartTransformationService,
  PillarTransformer,
  PillarName,
  LineChartData,
  DonutData,
  DataSufficiencyConfig,
  ChartTargetConfig
} from './types';

export {
  ChartTransformationError,
  InsufficientDataError,
  DEFAULT_CONFIG,
  DEFAULT_TARGETS,
  CACHE_CONFIG
} from './types';

// Export utilities for advanced use cases
export { aggregationUtils, dateUtils, validationUtils } from './aggregationUtils';

// Export transformer classes for testing or advanced usage
export { SafetyTransformer };

// Re-export the main service class for dependency injection or testing
export { ChartTransformationService } from './ChartTransformationService';
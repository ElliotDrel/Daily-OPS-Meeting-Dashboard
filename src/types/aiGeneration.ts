// AI Generation Types - Comprehensive type definitions for AI-powered meeting notes generation
// These types support the full workflow from AI generation to Supabase persistence

import { ActionItem, MeetingNote } from '@/hooks/usePillarData'

// Core pillar types matching the existing system
export type PillarType = 'safety' | 'quality' | 'cost' | 'delivery' | 'inventory' | 'production'

// AI Generated Content Structure
export interface PillarContent {
  meeting_notes: string[]
  action_items: string[]
}

export interface GeneratedContent {
  safety: PillarContent
  quality: PillarContent
  cost: PillarContent
  delivery: PillarContent
  inventory: PillarContent
  production: PillarContent
}

// Processed content for local editing (with IDs for tracking)
export interface EditableNote {
  id: string // temporary local ID
  content: string
  isEdited: boolean
}

export interface EditableActionItem {
  id: string // temporary local ID
  description: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  dueDate: string // ISO date string
  isEdited: boolean
}

export interface EditablePillarContent {
  meeting_notes: EditableNote[]
  action_items: EditableActionItem[]
}

export interface EditableGeneratedContent {
  safety: EditablePillarContent
  quality: EditablePillarContent
  cost: EditablePillarContent
  delivery: EditablePillarContent
  inventory: EditablePillarContent
  production: EditablePillarContent
}

// Existing content from Supabase (for days that already have data)
export interface ExistingPillarContent {
  meeting_note: MeetingNote | null
  action_items: ActionItem[]
}

export interface ExistingContent {
  safety: ExistingPillarContent
  quality: ExistingPillarContent
  cost: ExistingPillarContent
  delivery: ExistingPillarContent
  inventory: ExistingPillarContent
  production: ExistingPillarContent
  hasExistingData: boolean
}

// AI Service Configuration
export interface OpenAIConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  timeout: number // milliseconds
}

// AI Service Error Types
export type AIErrorType = 
  | 'api_key_missing'
  | 'api_key_invalid' 
  | 'network_error'
  | 'rate_limit_exceeded'
  | 'invalid_response'
  | 'json_parse_error'
  | 'timeout_error'
  | 'insufficient_quota'
  | 'content_too_long'
  | 'unknown_error'

export interface AIServiceError {
  type: AIErrorType
  message: string
  retryable: boolean
  retryAfter?: number // seconds to wait before retry
  details?: Record<string, unknown>
}

// AI Generation State Management
export type AIGenerationStatus = 
  | 'idle'           // Initial state, ready to generate
  | 'validating'     // Checking prerequisites (transcript exists, API key valid)
  | 'generating'     // API call in progress
  | 'processing'     // Parsing and validating response
  | 'success'        // Generation completed successfully
  | 'error'          // Generation failed
  | 'regenerating'   // Regenerating all content (with user confirmation)

export interface AIGenerationState {
  status: AIGenerationStatus
  generatedContent: EditableGeneratedContent | null
  existingContent: ExistingContent | null
  error: AIServiceError | null
  isRegenerating: boolean
  lastGeneratedAt: Date | null
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// API Request/Response Types
export interface GenerateNotesRequest {
  transcript: string
  additionalNotes: string
  date: string // ISO date string for context
}

export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Data Persistence Types (for Supabase operations)
export interface PersistableNote {
  pillar: PillarType
  note_date: string
  key_points: string // newline-separated notes
}

export interface PersistableActionItem {
  pillar: PillarType
  item_date: string
  description: string
  assignee: string | null
  priority: string
  status: string
  due_date: string | null
}

export interface BatchPersistRequest {
  notes: PersistableNote[]
  actionItems: PersistableActionItem[]
  date: string
}

// Component Props Types
export interface AIGenerationButtonProps {
  disabled: boolean
  onGenerate: () => Promise<void>
  status: AIGenerationStatus
  error: AIServiceError | null
}

export interface MeetingNotesApprovalInterfaceProps {
  generatedContent: EditableGeneratedContent
  existingContent: ExistingContent
  onContentEdit: (pillar: PillarType, type: 'note' | 'action_item', id: string, field: string, value: string) => void
  onContentDelete: (pillar: PillarType, type: 'note' | 'action_item', id: string) => void
  onApproveAll: () => Promise<void>
  onRegenerateAll: () => Promise<void>
  isApproving: boolean
  isRegenerating: boolean
}

export interface PillarNotesSectionProps {
  pillar: PillarType
  pillarContent: EditablePillarContent
  existingContent: ExistingPillarContent
  onContentEdit: (type: 'note' | 'action_item', id: string, field: string, value: string) => void
  onContentDelete: (type: 'note' | 'action_item', id: string) => void
  readOnly: boolean
}

// Hook Return Types
export interface UseAIGenerationReturn {
  state: AIGenerationState
  generateNotes: (transcript: string, additionalNotes: string, date: string) => Promise<void>
  regenerateAll: () => Promise<void>
  editContent: (pillar: PillarType, type: 'note' | 'action_item', id: string, field: string, value: string) => void
  deleteContent: (pillar: PillarType, type: 'note' | 'action_item', id: string) => void
  approveAll: () => Promise<void>
  resetGeneration: () => void
  canGenerate: boolean
  hasExistingData: boolean
}

// Validation Schemas (for runtime validation)
export interface GeneratedContentValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  partialContent?: Partial<GeneratedContent>
}

// Analytics and Monitoring Types
export interface AIGenerationMetrics {
  generationTime: number // milliseconds
  tokenUsage: number
  successRate: number
  errorRate: number
  regenerationRate: number
  approvalRate: number
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type PillarContentKey = keyof EditablePillarContent
export type GeneratedContentKey = keyof EditableGeneratedContent

// Constants for type safety
export const PILLARS: readonly PillarType[] = [
  'safety', 
  'quality', 
  'cost', 
  'delivery', 
  'inventory', 
  'production'
] as const

export const AI_GENERATION_STATUSES: readonly AIGenerationStatus[] = [
  'idle',
  'validating', 
  'generating',
  'processing',
  'success',
  'error',
  'regenerating'
] as const

export const AI_ERROR_TYPES: readonly AIErrorType[] = [
  'api_key_missing',
  'api_key_invalid',
  'network_error', 
  'rate_limit_exceeded',
  'invalid_response',
  'json_parse_error',
  'timeout_error',
  'insufficient_quota',
  'content_too_long',
  'unknown_error'
] as const

// Type guards for runtime validation
export const isValidPillar = (pillar: string): pillar is PillarType => {
  return PILLARS.includes(pillar as PillarType)
}

export const isValidGenerationStatus = (status: string): status is AIGenerationStatus => {
  return AI_GENERATION_STATUSES.includes(status as AIGenerationStatus)
}

export const isValidErrorType = (type: string): type is AIErrorType => {
  return AI_ERROR_TYPES.includes(type as AIErrorType)
}
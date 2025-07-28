// TypeScript interfaces for Pillar Data Collection System

export type PillarType = 'safety' | 'quality' | 'cost' | 'delivery' | 'inventory' | 'production'

export type QuestionType = 'boolean' | 'number' | 'select' | 'text' | 'textarea' | 'multi_select'

export interface PillarQuestion {
  id: string
  pillar: PillarType
  question_text: string
  question_type: QuestionType
  question_key: string
  options?: string[] | null // For select/multi_select questions
  conditional_parent?: string | null // References another question_key
  conditional_value?: unknown | null // Value that parent must have to show this question
  is_required: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PillarResponse {
  id: string
  pillar: PillarType
  date: string // YYYY-MM-DD format
  user_name: string
  question_id: string
  answer: unknown // JSONB - flexible storage for any answer type
  created_at: string
  updated_at: string
}

// UI-specific interfaces for form handling
export interface QuestionFormData {
  [questionKey: string]: unknown
}

// Enhanced question interface with conditional logic for UI
export interface UIQuestion extends PillarQuestion {
  shouldShow?: boolean // Computed based on conditional logic
  isDynamic?: boolean // For dynamically generated questions (like Safety incidents)
}

// Special type for Safety incident details (dynamically generated)
export interface IncidentDetail {
  incident_number: number
  description: string
}

// Response submission payload
export interface ResponseSubmission {
  pillar: PillarType
  date: string
  user_name: string
  responses: Array<{
    question_key: string
    question_id: string
    answer: unknown
  }>
}

// Hook return type extension (to be added to existing usePillarData return)
export interface PillarDataCollectionExtension {
  questions: PillarQuestion[]
  dailyResponses: PillarResponse[]
  isQuestionsLoading: boolean
  submitResponses: (submission: ResponseSubmission) => Promise<void>
  updateResponses: (submission: ResponseSubmission) => Promise<void>
  hasResponses: boolean // Whether user has already responded today
}
// Question seeding script for pillar data collection system
import { supabase } from '@/lib/supabase'
import { PillarQuestion, PillarType, QuestionType } from '@/types/pillarData'

interface QuestionSeed {
  pillar: PillarType
  question_text: string
  question_type: QuestionType
  question_key: string
  options?: string[]
  conditional_parent?: string
  conditional_value?: unknown
  is_required: boolean
  display_order: number
}

// Predefined questions for each pillar based on requirements
const SEED_QUESTIONS: QuestionSeed[] = [
  // Safety Pillar Questions
  {
    pillar: 'safety',
    question_text: 'Were there any safety incidents since the last meeting?',
    question_type: 'boolean',
    question_key: 'has_incidents',
    is_required: true,
    display_order: 1
  },
  {
    pillar: 'safety',
    question_text: 'How many incidents occurred?',
    question_type: 'select',
    question_key: 'incident_count',
    options: ['1', '2', '3', '4', '5', '6+'],
    conditional_parent: 'has_incidents',
    conditional_value: true,
    is_required: true,
    display_order: 2
  },
  // Note: Dynamic incident detail questions will be generated client-side based on incident_count

  // Quality Pillar Questions
  {
    pillar: 'quality',
    question_text: 'Has there been any major quality issues?',
    question_type: 'boolean',
    question_key: 'has_quality_issues',
    is_required: true,
    display_order: 1
  },

  // Inventory Pillar Questions
  {
    pillar: 'inventory',
    question_text: 'What models are in backlog?',
    question_type: 'multi_select',
    question_key: 'backlog_models',
    options: ['14"', '16"', '20"-small', '20"-large', '24"', '26"', 'adult-small', 'adult-large'],
    is_required: false,
    display_order: 1
  },

  // Delivery Pillar Questions
  {
    pillar: 'delivery',
    question_text: 'How many containers expected today?',
    question_type: 'number',
    question_key: 'containers_expected',
    is_required: true,
    display_order: 1
  },

  // Production Pillar Questions
  {
    pillar: 'production',
    question_text: 'What is the planned output for today?',
    question_type: 'number',
    question_key: 'planned_output_today',
    is_required: true,
    display_order: 1
  },
  {
    pillar: 'production',
    question_text: 'What was the actual output for yesterday?',
    question_type: 'number',
    question_key: 'actual_output_yesterday',
    is_required: true,
    display_order: 2
  }
]

/**
 * Seeds the pillar_questions table with predefined questions
 * This should be run once during initial setup
 */
export async function seedQuestions(): Promise<void> {
  try {
    console.log('🌱 Starting question seeding...')

    // First, check if questions already exist
    const { data: existingQuestions, error: checkError } = await supabase
      .from('pillar_questions')
      .select('pillar, question_key')

    if (checkError) {
      throw new Error(`Error checking existing questions: ${checkError.message}`)
    }

    // Create a Set of existing question keys for quick lookup
    const existingKeys = new Set(
      existingQuestions?.map(q => `${q.pillar}:${q.question_key}`) || []
    )

    // Filter out questions that already exist
    const questionsToInsert = SEED_QUESTIONS.filter(q => 
      !existingKeys.has(`${q.pillar}:${q.question_key}`)
    )

    if (questionsToInsert.length === 0) {
      console.log('✅ All questions already exist in database')
      return
    }

    console.log(`📝 Inserting ${questionsToInsert.length} new questions...`)

    // Insert new questions
    const { error: insertError } = await supabase
      .from('pillar_questions')
      .insert(questionsToInsert.map(q => ({
        pillar: q.pillar,
        question_text: q.question_text,
        question_type: q.question_type,
        question_key: q.question_key,
        options: q.options ? JSON.stringify(q.options) : null,
        conditional_parent: q.conditional_parent || null,
        conditional_value: q.conditional_value !== undefined ? JSON.stringify(q.conditional_value) : null,
        is_required: q.is_required,
        display_order: q.display_order,
        is_active: true
      })))

    if (insertError) {
      throw new Error(`Error inserting questions: ${insertError.message}`)
    }

    console.log('✅ Questions seeded successfully!')
    
    // Log summary by pillar
    const summary = SEED_QUESTIONS.reduce((acc, q) => {
      acc[q.pillar] = (acc[q.pillar] || 0) + 1
      return acc
    }, {} as Record<PillarType, number>)

    console.log('📊 Questions by pillar:', summary)

  } catch (error) {
    console.error('❌ Error seeding questions:', error)
    throw error
  }
}

/**
 * Retrieves all active questions for a specific pillar
 */
export async function getQuestionsForPillar(pillar: PillarType): Promise<PillarQuestion[]> {
  const { data, error } = await supabase
    .from('pillar_questions')
    .select('*')
    .eq('pillar', pillar)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Error fetching questions for ${pillar}: ${error.message}`)
  }

  // Parse JSONB fields and transform data
  return (data || []).map(q => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
    conditional_value: q.conditional_value ? JSON.parse(q.conditional_value) : null
  })) as PillarQuestion[]
}

/**
 * Utility function to run seeding from console/development
 * Usage: import { runSeedQuestions } from '@/services/seedQuestions'
 */
export async function runSeedQuestions(): Promise<void> {
  console.log('Starting question seeding process...')
  await seedQuestions()
  console.log('Question seeding complete!')
}
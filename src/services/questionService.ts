// Question service for pillar data collection system
import { supabase } from '@/lib/supabase'
import { PillarQuestion, PillarType } from '@/types/pillarData'

/**
 * Fetches all active questions for a specific pillar
 */
export async function fetchQuestionsForPillar(pillar: PillarType): Promise<PillarQuestion[]> {
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
 * Fetches questions for multiple pillars in a single query (for dashboard overview)
 */
export async function fetchQuestionsForPillars(pillars: PillarType[]): Promise<Record<PillarType, PillarQuestion[]>> {
  const { data, error } = await supabase
    .from('pillar_questions')
    .select('*')
    .in('pillar', pillars)
    .eq('is_active', true)
    .order('pillar', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Error fetching questions for pillars: ${error.message}`)
  }

  // Group by pillar and parse JSONB fields
  const grouped = (data || []).reduce((acc, q) => {
    const pillar = q.pillar as PillarType
    if (!acc[pillar]) {
      acc[pillar] = []
    }
    acc[pillar].push({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      conditional_value: q.conditional_value ? JSON.parse(q.conditional_value) : null
    } as PillarQuestion)
    return acc
  }, {} as Record<PillarType, PillarQuestion[]>)

  return grouped
}

/**
 * Creates a new question (admin functionality)
 */
export async function createQuestion(questionData: Omit<PillarQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<PillarQuestion> {
  const { data, error } = await supabase
    .from('pillar_questions')
    .insert({
      ...questionData,
      options: questionData.options ? JSON.stringify(questionData.options) : null,
      conditional_value: questionData.conditional_value !== undefined ? JSON.stringify(questionData.conditional_value) : null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating question: ${error.message}`)
  }

  return {
    ...data,
    options: data.options ? JSON.parse(data.options) : null,
    conditional_value: data.conditional_value ? JSON.parse(data.conditional_value) : null
  } as PillarQuestion
}

/**
 * Updates an existing question (admin functionality)
 */
export async function updateQuestion(id: string, updates: Partial<Omit<PillarQuestion, 'id' | 'created_at' | 'updated_at'>>): Promise<PillarQuestion> {
  const { data, error } = await supabase
    .from('pillar_questions')
    .update({
      ...updates,
      options: updates.options ? JSON.stringify(updates.options) : undefined,
      conditional_value: updates.conditional_value !== undefined ? JSON.stringify(updates.conditional_value) : undefined,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating question: ${error.message}`)
  }

  return {
    ...data,
    options: data.options ? JSON.parse(data.options) : null,
    conditional_value: data.conditional_value ? JSON.parse(data.conditional_value) : null
  } as PillarQuestion
}

/**
 * Deactivates a question (soft delete)
 */
export async function deactivateQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('pillar_questions')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    throw new Error(`Error deactivating question: ${error.message}`)
  }
}

/**
 * Reorders questions for a pillar (admin functionality)
 */
export async function reorderQuestions(pillar: PillarType, questionIds: string[]): Promise<void> {
  const updates = questionIds.map((id, index) => ({
    id,
    display_order: index + 1,
    updated_at: new Date().toISOString()
  }))

  for (const update of updates) {
    const { error } = await supabase
      .from('pillar_questions')
      .update({ 
        display_order: update.display_order,
        updated_at: update.updated_at
      })
      .eq('id', update.id)
      .eq('pillar', pillar)

    if (error) {
      throw new Error(`Error reordering questions: ${error.message}`)
    }
  }
}
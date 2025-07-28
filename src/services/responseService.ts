// Response service for pillar data collection system
import { supabase } from '@/lib/supabase'
import { PillarResponse, PillarType, ResponseSubmission } from '@/types/pillarData'

/**
 * Fetches responses for a specific pillar and date
 */
export async function fetchResponsesForPillarAndDate(
  pillar: PillarType, 
  date: string, 
  userName?: string
): Promise<PillarResponse[]> {
  let query = supabase
    .from('pillar_responses')
    .select('*')
    .eq('pillar', pillar)
    .eq('date', date)

  if (userName) {
    query = query.eq('user_name', userName)
  }

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Error fetching responses: ${error.message}`)
  }

  // Parse JSONB answer field
  return (data || []).map(r => ({
    ...r,
    answer: typeof r.answer === 'string' ? JSON.parse(r.answer) : r.answer
  })) as PillarResponse[]
}

/**
 * Fetches responses for a date range (for historical analysis)
 */
export async function fetchResponsesForDateRange(
  pillar: PillarType,
  startDate: string,
  endDate: string,
  userName?: string
): Promise<PillarResponse[]> {
  let query = supabase
    .from('pillar_responses')
    .select('*')
    .eq('pillar', pillar)
    .gte('date', startDate)
    .lte('date', endDate)

  if (userName) {
    query = query.eq('user_name', userName)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching responses for date range: ${error.message}`)
  }

  // Parse JSONB answer field
  return (data || []).map(r => ({
    ...r,
    answer: typeof r.answer === 'string' ? JSON.parse(r.answer) : r.answer
  })) as PillarResponse[]
}

/**
 * Submits responses for a pillar on a specific date
 * Uses delete-and-create strategy - deletes existing responses and creates new ones
 */
export async function submitResponses(submission: ResponseSubmission): Promise<PillarResponse[]> {
  const { pillar, date, user_name, responses } = submission

  try {
    console.log('🗑️ Deleting existing responses for:', {pillar, date, user_name})
    
    // First, get existing responses to confirm they exist
    const { data: existingData, error: fetchError } = await supabase
      .from('pillar_responses')
      .select('id')
      .eq('pillar', pillar)
      .eq('date', date)
      .eq('user_name', user_name)

    if (fetchError) {
      console.error('Fetch error:', fetchError)
    } else {
      console.log('📋 Found existing responses:', existingData?.length || 0)
    }

    // Delete all existing responses for this user/date/pillar combination
    const { error: deleteError, count: deletedCount } = await supabase
      .from('pillar_responses')
      .delete({ count: 'exact' })
      .eq('pillar', pillar)
      .eq('date', date)
      .eq('user_name', user_name)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      // Don't throw error, continue with upsert instead
    } else {
      console.log('🗑️ Deleted responses count:', deletedCount)
    }

    // Prepare new responses for insertion
    const responsesToInsert = responses.map(r => ({
      pillar,
      date,
      user_name,
      question_id: r.question_id,
      answer: JSON.stringify(r.answer)
    }))

    console.log('🔄 Inserting responses:', responsesToInsert)

    // Always use upsert to handle any remaining conflicts
    const { data, error: upsertError } = await supabase
      .from('pillar_responses')
      .upsert(responsesToInsert, {
        onConflict: 'pillar,date,user_name,question_id',
        ignoreDuplicates: false
      })
      .select()

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      throw new Error(`Error upserting responses: ${upsertError.message}`)
    }

    console.log('✅ Successfully upserted responses:', data?.length || 0)

    // Parse JSONB answer field in returned data
    return (data || []).map(r => ({
      ...r,
      answer: typeof r.answer === 'string' ? JSON.parse(r.answer) : r.answer
    })) as PillarResponse[]

  } catch (error) {
    console.error('submitResponses error:', error)
    throw error
  }
}

/**
 * Updates specific responses (for editing existing submissions)
 * Uses the same delete-and-create strategy as submitResponses
 */
export async function updateResponses(submission: ResponseSubmission): Promise<PillarResponse[]> {
  // For updates, we use the same delete-and-create logic as submitResponses
  // This ensures consistency and fresh data on every update
  return submitResponses(submission)
}

/**
 * Deletes responses for a specific date and user (if user wants to clear their submission)
 */
export async function deleteResponsesForDate(
  pillar: PillarType,
  date: string,
  userName: string
): Promise<void> {
  const { error } = await supabase
    .from('pillar_responses')
    .delete()
    .eq('pillar', pillar)
    .eq('date', date)
    .eq('user_name', userName)

  if (error) {
    throw new Error(`Error deleting responses: ${error.message}`)
  }
}

/**
 * Deletes a specific response by ID
 */
export async function deleteResponse(responseId: string): Promise<void> {
  const { error } = await supabase
    .from('pillar_responses')
    .delete()
    .eq('id', responseId)

  if (error) {
    throw new Error(`Error deleting response: ${error.message}`)
  }
}

/**
 * Checks if user has already submitted responses for a specific pillar and date
 */
export async function hasResponsesForDate(
  pillar: PillarType,
  date: string,
  userName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('pillar_responses')
    .select('id')
    .eq('pillar', pillar)
    .eq('date', date)
    .eq('user_name', userName)
    .limit(1)

  if (error) {
    throw new Error(`Error checking existing responses: ${error.message}`)
  }

  return (data && data.length > 0) || false
}

/**
 * Gets response statistics for a pillar across all dates (for admin/analytics)
 */
export async function getResponseStats(pillar: PillarType): Promise<{
  totalResponses: number
  uniqueUsers: number
  uniqueDates: number
  latestResponseDate: string | null
}> {
  const { data, error } = await supabase
    .from('pillar_responses')
    .select('user_name, date')
    .eq('pillar', pillar)

  if (error) {
    throw new Error(`Error fetching response stats: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return {
      totalResponses: 0,
      uniqueUsers: 0,
      uniqueDates: 0,
      latestResponseDate: null
    }
  }

  const uniqueUsers = new Set(data.map(r => r.user_name)).size
  const uniqueDates = new Set(data.map(r => r.date)).size
  const latestResponseDate = Math.max(...data.map(r => new Date(r.date).getTime()))

  return {
    totalResponses: data.length,
    uniqueUsers,
    uniqueDates,
    latestResponseDate: new Date(latestResponseDate).toISOString().split('T')[0]
  }
}
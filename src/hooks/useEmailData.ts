import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { subDays, parseISO, format } from 'date-fns'

export interface MeetingNote {
  id: string
  pillar: string
  note_date: string
  key_points: string
  keyPoints?: string[] // Transformed for UI
  created_at: string
  updated_at: string
}

export interface ActionItem {
  id: string
  pillar: string
  item_date: string
  description: string
  assignee: string | null
  priority: string
  status: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface PillarData {
  pillar: string
  todayNote: MeetingNote | null
  todayActionItems: ActionItem[]
  yesterdayNote: MeetingNote | null
  yesterdayActionItems: ActionItem[]
}

const PILLARS = ['safety', 'quality', 'cost', 'delivery', 'inventory', 'production', 'people']

export const useEmailData = (selectedDate: string) => {
  // Calculate yesterday's date (timezone-safe using date-fns)
  const selectedDateObj = parseISO(selectedDate)
  const yesterdayDate = subDays(selectedDateObj, 1)
  const yesterdayString = format(yesterdayDate, 'yyyy-MM-dd')

  // Fetch data for all pillars
  const { data: emailData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['email-data', selectedDate, yesterdayString],
    queryFn: async (): Promise<PillarData[]> => {
      const results = await Promise.allSettled(
        PILLARS.map(async (pillar): Promise<PillarData> => {
          // Fetch today's meeting note
          const { data: todayNote, error: todayNoteError } = await supabase
            .from('meeting_notes')
            .select('*')
            .eq('pillar', pillar)
            .eq('note_date', selectedDate)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()
          
          if (todayNoteError) throw todayNoteError

          // Fetch yesterday's meeting note
          const { data: yesterdayNote, error: yesterdayNoteError } = await supabase
            .from('meeting_notes')
            .select('*')
            .eq('pillar', pillar)
            .eq('note_date', yesterdayString)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()
          
          if (yesterdayNoteError) throw yesterdayNoteError

          // Fetch today's action items
          const { data: todayActionItems, error: todayActionItemsError } = await supabase
            .from('action_items')
            .select('*')
            .eq('pillar', pillar)
            .eq('item_date', selectedDate)
            .order('created_at', { ascending: true })
          
          if (todayActionItemsError) throw todayActionItemsError

          // Fetch yesterday's action items
          const { data: yesterdayActionItems, error: yesterdayActionItemsError } = await supabase
            .from('action_items')
            .select('*')
            .eq('pillar', pillar)
            .eq('item_date', yesterdayString)
            .order('created_at', { ascending: true })
          
          if (yesterdayActionItemsError) throw yesterdayActionItemsError

          // Transform meeting notes to UI format
          const transformNote = (note: MeetingNote | null): MeetingNote | null => {
            if (!note) return null
            return {
              ...note,
              keyPoints: note.key_points ? note.key_points.split('\n').filter((p: string) => p.trim()) : []
            }
          }

          return {
            pillar,
            todayNote: transformNote(todayNote),
            todayActionItems: todayActionItems || [],
            yesterdayNote: transformNote(yesterdayNote),
            yesterdayActionItems: yesterdayActionItems || []
          }
        })
      )

      // Handle any failed pillar requests
      const successfulResults: PillarData[] = []
      const failedPillars: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value)
        } else {
          failedPillars.push(PILLARS[index])
          console.error(`Failed to fetch data for pillar ${PILLARS[index]}:`, result.reason)
        }
      })

      if (failedPillars.length > 0) {
        console.warn(`Failed to fetch data for pillars: ${failedPillars.join(', ')}`)
      }

      return successfulResults
    }
  })

  return {
    emailData,
    isLoading,
    error,
    refetch,
    selectedDate,
    yesterdayString
  }
}
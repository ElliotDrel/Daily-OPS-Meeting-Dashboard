import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useEffect, useCallback } from 'react'
import { subDays, addDays, parseISO, format, startOfWeek, endOfWeek } from 'date-fns'
import { fetchQuestionsForPillar } from '@/services/questionService'
import { fetchResponsesForPillarAndDate, submitResponses, hasResponsesForDate } from '@/services/responseService'
import { PillarQuestion, PillarResponse, PillarType, ResponseSubmission } from '@/types/pillarData'

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

// Enhanced hook with performance optimizations
export const usePillarDataOptimized = (pillar: string, selectedDate: string) => {
  const queryClient = useQueryClient()

  // Calculate date ranges for prefetching (timezone-safe using date-fns)
  const selectedDateObj = parseISO(selectedDate) // Parse YYYY-MM-DD string safely
  
  // Calculate yesterday (timezone-safe)
  const yesterdayDate = subDays(selectedDateObj, 1)
  const yesterdayString = format(yesterdayDate, 'yyyy-MM-dd')

  // Calculate tomorrow (timezone-safe)
  const tomorrowDate = addDays(selectedDateObj, 1)
  const tomorrowString = format(tomorrowDate, 'yyyy-MM-dd')
  
  // DEBUG: Log date calculations to help diagnose Issue 1
  console.log('🔍 DATE DEBUG:', {
    selected: selectedDate,
    yesterday: yesterdayString,
    tomorrow: tomorrowString
  })

  // Optimized query functions with batch loading
  const fetchNotesForDateRange = useCallback(async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('meeting_notes')
      .select('*')
      .eq('pillar', pillar)
      .gte('note_date', startDate)
      .lte('note_date', endDate)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Group by date and transform
    const groupedData: Record<string, MeetingNote[]> = {}
    ;(data as MeetingNote[]).forEach(note => {
      if (!groupedData[note.note_date]) {
        groupedData[note.note_date] = []
      }
      groupedData[note.note_date].push({
        ...note,
        keyPoints: note.key_points ? note.key_points.split('\n').filter(p => p.trim()) : []
      })
    })
    
    return groupedData
  }, [pillar])

  const fetchActionItemsForDateRange = useCallback(async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('pillar', pillar)
      .gte('item_date', startDate)
      .lte('item_date', endDate)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Group by date
    const groupedData: Record<string, ActionItem[]> = {}
    ;(data as ActionItem[]).forEach(item => {
      if (!groupedData[item.item_date]) {
        groupedData[item.item_date] = []
      }
      groupedData[item.item_date].push(item)
    })
    
    return groupedData
  }, [pillar])

  // Batch query for 3-day window (yesterday, today, tomorrow)
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['meeting-notes-batch', pillar, yesterdayString, tomorrowString],
    queryFn: () => fetchNotesForDateRange(yesterdayString, tomorrowString),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const { data: actionItemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['action-items-batch', pillar, yesterdayString, tomorrowString],
    queryFn: () => fetchActionItemsForDateRange(yesterdayString, tomorrowString),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Extract data for specific dates from batch results
  const meetingNotes = notesData?.[selectedDate] || []
  const yesterdayMeetingNotes = notesData?.[yesterdayString] || []
  const actionItems = actionItemsData?.[selectedDate] || []
  const yesterdayActionItems = actionItemsData?.[yesterdayString] || []

  // Get single notes (first entry from arrays for compatibility)
  const meetingNote = meetingNotes[0] || null
  const yesterdayMeetingNote = yesterdayMeetingNotes[0] || null
  
  // DEBUG: Log what dates we actually get from database vs what we expected
  if (yesterdayMeetingNote) {
    console.log('🔍 YESTERDAY DEBUG:', {
      expectedDate: yesterdayString,
      actualNoteDate: yesterdayMeetingNote.note_date,
      match: yesterdayString === yesterdayMeetingNote.note_date
    })
  }

  // Load last recorded meeting note (FIXED: now filters by date to prevent future notes)
  const { data: lastRecordedNote = null, isLoading: lastRecordedNotesLoading } = useQuery({
    queryKey: ['last-meeting-note', pillar, selectedDate, yesterdayString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('pillar', pillar)
        .lt('note_date', yesterdayString) // CRITICAL FIX: Only get notes BEFORE yesterday
        .order('note_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      // Transform Supabase data to UI format (no longer need date filtering since SQL handles it)
      if (!data) return null
      return {
        ...data,
        keyPoints: data.key_points ? data.key_points.split('\n').filter(p => p.trim()) : []
      } as MeetingNote
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })

  // Load last recorded action items (FIXED: now filters by date to prevent future items)
  const { data: lastRecordedActionItems = [], isLoading: lastRecordedActionItemsLoading } = useQuery({
    queryKey: ['last-action-items', pillar, selectedDate, yesterdayString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('pillar', pillar)
        .lt('item_date', yesterdayString) // CRITICAL FIX: Only get items BEFORE yesterday
        .order('item_date', { ascending: false })
        .limit(10) // Get up to 10 items from the most recent date
      
      if (error) throw error
      
      const result = (data as ActionItem[]) || []
      console.log('🔍 LAST RECORDED ACTION ITEMS QUERY:', {
        pillar,
        yesterdayString,
        resultCount: result.length,
        items: result.slice(0, 3).map(item => ({ 
          date: item.item_date, 
          desc: item.description?.substring(0, 50),
          hasDesc: !!item.description,
          descLength: item.description?.length || 0,
          fullItem: item
        }))
      })
      return result
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })

  // Load questions for the pillar (cached with long stale time since questions rarely change)
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['pillar-questions', pillar],
    queryFn: () => fetchQuestionsForPillar(pillar as PillarType),
    staleTime: 30 * 60 * 1000, // 30 minutes - questions don't change often
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
  })

  // Load responses for the selected date
  const { data: dailyResponses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['pillar-responses', pillar, selectedDate],
    queryFn: () => fetchResponsesForPillarAndDate(pillar as PillarType, selectedDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Check if user has already responded today (assumes single user for now)
  const { data: hasResponses = false, isLoading: hasResponsesLoading } = useQuery({
    queryKey: ['has-responses', pillar, selectedDate],
    queryFn: async () => {
      // For now, use 'default_user' - this can be enhanced with actual user management
      const userName = 'default_user'
      return hasResponsesForDate(pillar as PillarType, selectedDate, userName)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Background prefetching for adjacent weeks
  useEffect(() => {
    const prefetchAdjacentWeeks = () => {
      // Calculate week boundaries using date-fns (timezone-safe)
      const selectedDateObj = parseISO(selectedDate)
      const currentWeekStart = startOfWeek(selectedDateObj)
      const previousWeekStart = subDays(currentWeekStart, 7)
      const nextWeekEnd = endOfWeek(addDays(currentWeekStart, 7))
      
      // Prefetch previous and next weeks
      const prefetchStart = format(previousWeekStart, 'yyyy-MM-dd')
      const prefetchEnd = format(nextWeekEnd, 'yyyy-MM-dd')
      
      queryClient.prefetchQuery({
        queryKey: ['meeting-notes-prefetch', pillar, prefetchStart, prefetchEnd],
        queryFn: () => fetchNotesForDateRange(prefetchStart, prefetchEnd),
        staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
      })
      
      queryClient.prefetchQuery({
        queryKey: ['action-items-prefetch', pillar, prefetchStart, prefetchEnd],
        queryFn: () => fetchActionItemsForDateRange(prefetchStart, prefetchEnd),
        staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
      })
    }

    // Debounce prefetching
    const timer = setTimeout(prefetchAdjacentWeeks, 1000)
    return () => clearTimeout(timer)
  }, [pillar, selectedDate, queryClient, fetchActionItemsForDateRange, fetchNotesForDateRange])

  // Optimized real-time subscriptions with throttling
  useEffect(() => {
    let invalidationTimer: NodeJS.Timeout | null = null
    
    const throttledInvalidation = (table: 'meeting_notes' | 'action_items') => {
      if (invalidationTimer) clearTimeout(invalidationTimer)
      
      invalidationTimer = setTimeout(() => {
        if (table === 'meeting_notes') {
          queryClient.invalidateQueries({ 
            queryKey: ['meeting-notes-batch', pillar],
            exact: false 
          })
        } else {
          queryClient.invalidateQueries({ 
            queryKey: ['action-items-batch', pillar],
            exact: false 
          })
        }
      }, 500) // 500ms throttle
    }

    const channel = supabase
      .channel(`pillar-${pillar}-optimized`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meeting_notes',
        filter: `pillar=eq.${pillar}` 
      }, () => {
        throttledInvalidation('meeting_notes')
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'action_items',
        filter: `pillar=eq.${pillar}` 
      }, () => {
        throttledInvalidation('action_items')
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pillar_questions',
        filter: `pillar=eq.${pillar}` 
      }, () => {
        // Questions changed - invalidate questions cache
        queryClient.invalidateQueries({ 
          queryKey: ['pillar-questions', pillar],
          exact: false 
        })
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pillar_responses',
        filter: `pillar=eq.${pillar}` 
      }, () => {
        // Responses changed - invalidate responses and has-responses cache
        queryClient.invalidateQueries({ 
          queryKey: ['pillar-responses', pillar],
          exact: false 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['has-responses', pillar],
          exact: false 
        })
      })
      .subscribe()

    return () => {
      if (invalidationTimer) clearTimeout(invalidationTimer)
      supabase.removeChannel(channel)
    }
  }, [pillar, queryClient])

  // Unified upsert mutation with proper optimistic updates
  const upsertNoteMutation = useMutation({
    mutationFn: async (keyPoints: string) => {
      // Try to update existing note first
      const { data: existingNote } = await supabase
        .from('meeting_notes')
        .select('id')
        .eq('pillar', pillar)
        .eq('note_date', selectedDate)
        .limit(1)
        .maybeSingle()
      
      if (existingNote) {
        // Update existing note
        const { data, error } = await supabase
          .from('meeting_notes')
          .update({ 
            key_points: keyPoints,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingNote.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('meeting_notes')
          .insert({
            pillar,
            note_date: selectedDate,
            key_points: keyPoints
          })
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    },
    onMutate: async (keyPoints) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['meeting-notes-batch', pillar] 
      })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['meeting-notes-batch', pillar, yesterdayString, tomorrowString])

      // Optimistically update with proper upsert logic
      if (previousData && typeof previousData === 'object') {
        const updatedData = { ...previousData as Record<string, MeetingNote[]> }
        if (!updatedData[selectedDate]) {
          updatedData[selectedDate] = []
        }

        // Check if note already exists
        const existingIndex = updatedData[selectedDate].findIndex(note => note.note_date === selectedDate)
        
        const optimisticNote: MeetingNote = {
          id: existingIndex >= 0 ? updatedData[selectedDate][existingIndex].id : `temp-${Date.now()}`,
          pillar,
          note_date: selectedDate,
          key_points: keyPoints,
          keyPoints: keyPoints.split('\n').filter(p => p.trim()),
          created_at: existingIndex >= 0 ? updatedData[selectedDate][existingIndex].created_at : new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        if (existingIndex >= 0) {
          // Update existing note
          updatedData[selectedDate][existingIndex] = optimisticNote
        } else {
          // Add new note
          updatedData[selectedDate] = [...updatedData[selectedDate], optimisticNote]
        }

        queryClient.setQueryData(
          ['meeting-notes-batch', pillar, yesterdayString, tomorrowString], 
          updatedData
        )
      }

      return { previousData }
    },
    onError: (err, keyPoints, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['meeting-notes-batch', pillar, yesterdayString, tomorrowString], 
          context.previousData
        )
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: ['meeting-notes-batch', pillar],
        exact: false 
      })
    }
  })

  const createItemMutation = useMutation({
    mutationFn: async (itemData: {
      description: string
      assignee?: string
      priority?: string
      status?: string
      due_date?: string
    }) => {
      const { data, error } = await supabase
        .from('action_items')
        .insert({
          pillar,
          item_date: selectedDate,
          ...itemData
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onMutate: async (itemData) => {
      await queryClient.cancelQueries({ 
        queryKey: ['action-items-batch', pillar] 
      })

      const previousData = queryClient.getQueryData(['action-items-batch', pillar, yesterdayString, tomorrowString])

      if (previousData && typeof previousData === 'object') {
        const optimisticItem: ActionItem = {
          id: `temp-${Date.now()}`,
          pillar,
          item_date: selectedDate,
          description: itemData.description,
          assignee: itemData.assignee || null,
          priority: itemData.priority || 'Medium',
          status: itemData.status || 'Open',
          due_date: itemData.due_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const updatedData = previousData ? { ...previousData as Record<string, ActionItem[]> } : {} as Record<string, ActionItem[]>
        if (!updatedData[selectedDate]) {
          updatedData[selectedDate] = []
        }
        updatedData[selectedDate] = [...updatedData[selectedDate], optimisticItem]

        queryClient.setQueryData(
          ['action-items-batch', pillar, yesterdayString, tomorrowString], 
          updatedData
        )
      }

      return { previousData }
    },
    onError: (err, itemData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['action-items-batch', pillar, yesterdayString, tomorrowString], 
          context.previousData
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['action-items-batch', pillar],
        exact: false 
      })
    }
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meeting_notes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['meeting-notes-batch', pillar],
        exact: false 
      })
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('action_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['action-items-batch', pillar],
        exact: false 
      })
    }
  })

  // Delete action item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['action-items-batch', pillar],
        exact: false 
      })
    }
  })

  // Submit responses mutation
  const submitResponsesMutation = useMutation({
    mutationFn: async (responses: ResponseSubmission) => {
      return await submitResponses(responses)
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['pillar-responses', pillar, selectedDate] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['has-responses', pillar, selectedDate] 
      })
    }
  })

  // Update responses mutation (same as submit due to upsert logic)
  const updateResponsesMutation = useMutation({
    mutationFn: async (responses: ResponseSubmission) => {
      return await submitResponses(responses)
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['pillar-responses', pillar, selectedDate] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['has-responses', pillar, selectedDate] 
      })
    }
  })

  return {
    // Existing returns
    meetingNote,
    meetingNotes,
    actionItems,
    yesterdayMeetingNote,
    yesterdayMeetingNotes,
    yesterdayActionItems,
    lastRecordedNote,
    lastRecordedActionItems,
    isLoading: notesLoading || itemsLoading,
    isYesterdayLoading: false, // Data comes from same batch query
    isLastRecordedLoading: lastRecordedNotesLoading,
    isLastRecordedActionItemsLoading: lastRecordedActionItemsLoading,
    upsertNote: upsertNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isUpsertingNote: upsertNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,
    isCreatingItem: createItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isDeletingItem: deleteItemMutation.isPending,
    
    // New data collection returns
    questions,
    dailyResponses,
    hasResponses,
    isQuestionsLoading: questionsLoading,
    isResponsesLoading: responsesLoading,
    isHasResponsesLoading: hasResponsesLoading,
    submitResponses: submitResponsesMutation.mutate,
    updateResponses: updateResponsesMutation.mutate,
    isSubmittingResponses: submitResponsesMutation.isPending,
    isUpdatingResponses: updateResponsesMutation.isPending
  }
}

// Export alias for backward compatibility
export const usePillarData = usePillarDataOptimized

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useEffect, useCallback } from 'react'

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

  // Calculate date ranges for prefetching (timezone-safe)
  const selectedDateParts = selectedDate.split('-').map(Number) // [YYYY, MM, DD]
  
  // Calculate yesterday (timezone-safe)
  const yesterdayDate = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2] - 1)
  const yesterdayString = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`

  // Calculate tomorrow (timezone-safe)
  const tomorrowDate = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2] + 1)
  const tomorrowString = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`

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

  // Load last recorded meeting note (when yesterday is empty and different from yesterday/today)
  const { data: lastRecordedNote = null, isLoading: lastRecordedNotesLoading } = useQuery({
    queryKey: ['last-meeting-note', pillar],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('pillar', pillar)
        .order('note_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      // Transform Supabase data to UI format
      if (!data || data.note_date === selectedDate || data.note_date === yesterdayString) return null
      return {
        ...data,
        keyPoints: data.key_points ? data.key_points.split('\n').filter(p => p.trim()) : []
      } as MeetingNote
    },
    enabled: !yesterdayMeetingNote, // Only fetch if yesterday note doesn't exist
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })

  // Background prefetching for adjacent weeks
  useEffect(() => {
    const prefetchAdjacentWeeks = () => {
      const currentWeekStart = new Date(selectedDate)
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() - 7) // Previous week
      
      const nextWeekEnd = new Date(selectedDate)
      nextWeekEnd.setDate(nextWeekEnd.getDate() - nextWeekEnd.getDay() + 13) // Next week
      
      // Prefetch previous and next weeks
      const prefetchStart = currentWeekStart.toISOString().slice(0, 10)
      const prefetchEnd = nextWeekEnd.toISOString().slice(0, 10)
      
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
      .subscribe()

    return () => {
      if (invalidationTimer) clearTimeout(invalidationTimer)
      supabase.removeChannel(channel)
    }
  }, [pillar, queryClient])

  // Optimized mutations with optimistic updates
  const createNoteMutation = useMutation({
    mutationFn: async (keyPoints: string) => {
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
    },
    onMutate: async (keyPoints) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['meeting-notes-batch', pillar] 
      })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['meeting-notes-batch', pillar, yesterdayString, tomorrowString])

      // Optimistically update
      if (previousData && typeof previousData === 'object') {
        const optimisticNote: MeetingNote = {
          id: `temp-${Date.now()}`,
          pillar,
          note_date: selectedDate,
          key_points: keyPoints,
          keyPoints: keyPoints.split('\n').filter(p => p.trim()),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const updatedData = previousData ? { ...previousData as Record<string, MeetingNote[]> } : {} as Record<string, MeetingNote[]>
        if (!updatedData[selectedDate]) {
          updatedData[selectedDate] = []
        }
        updatedData[selectedDate] = [...updatedData[selectedDate], optimisticNote]

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

  // Update mutations with optimistic updates
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, keyPoints }: { id: string, keyPoints: string }) => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .update({ 
          key_points: keyPoints,
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

  return {
    meetingNote,
    meetingNotes,
    actionItems,
    yesterdayMeetingNote,
    yesterdayMeetingNotes,
    yesterdayActionItems,
    lastRecordedNote,
    isLoading: notesLoading || itemsLoading,
    isYesterdayLoading: false, // Data comes from same batch query
    isLastRecordedLoading: lastRecordedNotesLoading,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    isCreatingNote: createNoteMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
    isCreatingItem: createItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending
  }
}

// Export alias for backward compatibility
export const usePillarData = usePillarDataOptimized

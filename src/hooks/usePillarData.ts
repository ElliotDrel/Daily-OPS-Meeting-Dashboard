import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
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

export const usePillarData = (pillar: string, selectedDate: string) => {
  const queryClient = useQueryClient()

  // Calculate yesterday's date (timezone-safe using date-fns)
  const selectedDateObj = parseISO(selectedDate)
  const yesterdayDate = subDays(selectedDateObj, 1)
  const yesterdayString = format(yesterdayDate, 'yyyy-MM-dd')

  // Load single meeting note for the day
  const { data: meetingNote = null, isLoading: notesLoading, refetch: refetchMeetingNote } = useQuery({
    queryKey: ['meeting-note', pillar, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('pillar', pillar)
        .eq('note_date', selectedDate)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      // Transform Supabase data to UI format
      if (!data) return null
      return {
        ...data,
        keyPoints: data.key_points ? data.key_points.split('\n').filter(p => p.trim()) : []
      } as MeetingNote
    }
  })

  // Load yesterday's single meeting note
  const { data: yesterdayMeetingNote = null, isLoading: yesterdayNotesLoading, refetch: refetchYesterdayMeetingNote } = useQuery({
    queryKey: ['meeting-note', pillar, yesterdayString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('pillar', pillar)
        .eq('note_date', yesterdayString)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      // Transform Supabase data to UI format
      if (!data) return null
      return {
        ...data,
        keyPoints: data.key_points ? data.key_points.split('\n').filter(p => p.trim()) : []
      } as MeetingNote
    }
  })

  // Load last recorded meeting note (FIXED: now filters by date to prevent future notes)
  const { data: lastRecordedNote = null, isLoading: lastRecordedNotesLoading, refetch: refetchLastRecordedNote } = useQuery({
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
    }
  })

  // Load action items  
  const { data: actionItems = [], isLoading: itemsLoading, refetch: refetchActionItems } = useQuery({
    queryKey: ['action-items', pillar, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('pillar', pillar)
        .eq('item_date', selectedDate)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as ActionItem[]
    }
  })

  // Load yesterday's action items
  const { data: yesterdayActionItems = [], isLoading: yesterdayItemsLoading, refetch: refetchYesterdayActionItems } = useQuery({
    queryKey: ['action-items', pillar, yesterdayString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('pillar', pillar)
        .eq('item_date', yesterdayString)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as ActionItem[]
    }
  })

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`pillar-${pillar}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meeting_notes',
        filter: `pillar=eq.${pillar}` 
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['meeting-note', pillar, selectedDate] })
        queryClient.invalidateQueries({ queryKey: ['meeting-note', pillar, yesterdayString] })
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'action_items',
        filter: `pillar=eq.${pillar}` 
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['action-items', pillar, selectedDate] })
        queryClient.invalidateQueries({ queryKey: ['action-items', pillar, yesterdayString] })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [pillar, selectedDate, yesterdayString, queryClient])

  // Upsert note mutation (create or update single entry)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-note', pillar, selectedDate] })
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
      queryClient.invalidateQueries({ queryKey: ['meeting-note', pillar, selectedDate] })
    }
  })

  // Create action item mutation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items', pillar, selectedDate] })
    }
  })

  // Update action item mutation
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
      queryClient.invalidateQueries({ queryKey: ['action-items', pillar, selectedDate] })
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
      queryClient.invalidateQueries({ queryKey: ['action-items', pillar, selectedDate] })
    }
  })

  // Handle refetch for all queries
  const refetch = () => {
    refetchMeetingNote();
    refetchActionItems();
    refetchYesterdayMeetingNote();
    refetchYesterdayActionItems();
    refetchLastRecordedNote();
  };

  return {
    meetingNote,
    actionItems,
    yesterdayMeetingNote,
    yesterdayActionItems,
    lastRecordedNote,
    lastRecordedActionItems: [], // Legacy hook - limited functionality
    isLoading: notesLoading || itemsLoading,
    isYesterdayLoading: yesterdayNotesLoading || yesterdayItemsLoading,
    isLastRecordedLoading: lastRecordedNotesLoading,
    isLastRecordedActionItemsLoading: false, // Legacy hook - limited functionality
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
    refetch
  }
}
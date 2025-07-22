import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

interface MeetingNote {
  id: string
  pillar: string
  note_date: string
  key_points: string
  keyPoints?: string[] // Transformed for UI
  created_at: string
  updated_at: string
}

interface ActionItem {
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

  // Load meeting notes
  const { data: meetingNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['meeting-notes', pillar, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('pillar', pillar)
        .eq('note_date', selectedDate)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      // Transform Supabase data to UI format
      return (data as MeetingNote[]).map(note => ({
        ...note,
        keyPoints: note.key_points ? note.key_points.split('\n').filter(p => p.trim()) : []
      }))
    }
  })

  // Load action items  
  const { data: actionItems = [], isLoading: itemsLoading } = useQuery({
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
        console.log('Meeting note changed:', payload)
        queryClient.invalidateQueries({ queryKey: ['meeting-notes', pillar, selectedDate] })
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'action_items',
        filter: `pillar=eq.${pillar}` 
      }, (payload) => {
        console.log('Action item changed:', payload)
        queryClient.invalidateQueries({ queryKey: ['action-items', pillar, selectedDate] })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [pillar, selectedDate, queryClient])

  // Create note mutation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', pillar, selectedDate] })
    }
  })

  // Update note mutation
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
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', pillar, selectedDate] })
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
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
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

  return {
    meetingNotes,
    actionItems,
    isLoading: notesLoading || itemsLoading,
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
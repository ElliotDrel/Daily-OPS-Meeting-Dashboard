// AI Generation Hook - Comprehensive state management for AI-powered meeting notes generation
// Integrates with existing Supabase patterns and provides full workflow management

import { useState, useCallback, useMemo, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { OpenAIService } from '@/services/openaiService'
import {
  AIGenerationState,
  AIGenerationStatus,
  EditableGeneratedContent,
  ExistingContent,
  GeneratedContent,
  PillarType,
  UseAIGenerationReturn,
  AIServiceError,
  BatchPersistRequest,
  PersistableNote,
  PersistableActionItem,
  EditableNote,
  EditableActionItem,
  PILLARS
} from '@/types/aiGeneration'
import { ActionItem, MeetingNote } from '@/hooks/usePillarData'
import { toast } from '@/components/ui/sonner'

export const useAIGeneration = (selectedDate: string) => {
  const queryClient = useQueryClient()
  const generationAbortController = useRef<AbortController | null>(null)

  // Core state management
  const [state, setState] = useState<AIGenerationState>({
    status: 'idle',
    generatedContent: null,
    existingContent: null,
    error: null,
    isRegenerating: false,
    lastGeneratedAt: null,
    tokenUsage: undefined
  })

  // Fetch existing content for the selected date
  const fetchExistingContent = useCallback(async (): Promise<ExistingContent> => {
    const existingContent: ExistingContent = {
      safety: { meeting_note: null, action_items: [] },
      quality: { meeting_note: null, action_items: [] },
      cost: { meeting_note: null, action_items: [] },
      delivery: { meeting_note: null, action_items: [] },
      inventory: { meeting_note: null, action_items: [] },
      production: { meeting_note: null, action_items: [] },
      people: { meeting_note: null, action_items: [] },
      hasExistingData: false
    }

    try {
      // Fetch existing meeting notes and action items for all pillars
      const [notesResponse, actionItemsResponse] = await Promise.all([
        supabase
          .from('meeting_notes')
          .select('*')
          .eq('note_date', selectedDate),
        supabase
          .from('action_items')
          .select('*')
          .eq('item_date', selectedDate)
      ])

      if (notesResponse.error) throw notesResponse.error
      if (actionItemsResponse.error) throw actionItemsResponse.error

      // Organize data by pillar
      const notes = notesResponse.data || []
      const actionItems = actionItemsResponse.data || []

      let hasData = false

      for (const pillar of PILLARS) {
        // Find meeting note for this pillar (there should be only one per pillar per date)
        const pillarNote = notes.find(note => note.pillar === pillar)
        if (pillarNote) {
          existingContent[pillar].meeting_note = {
            ...pillarNote,
            keyPoints: pillarNote.key_points ? pillarNote.key_points.split('\n').filter(p => p.trim()) : []
          } as MeetingNote
          hasData = true
        }

        // Find action items for this pillar
        const pillarActionItems = actionItems.filter(item => item.pillar === pillar)
        existingContent[pillar].action_items = pillarActionItems as ActionItem[]
        if (pillarActionItems.length > 0) {
          hasData = true
        }
      }

      existingContent.hasExistingData = hasData
      return existingContent

    } catch (error) {
      console.error('Error fetching existing content:', error)
      // Return empty structure on error, but log it
      return existingContent
    }
  }, [selectedDate])

  // Generate meeting notes and action items
  const generateNotes = useCallback(async (
    transcript: string,
    additionalNotes: string,
    date: string
  ): Promise<void> => {
    // Abort any ongoing generation
    if (generationAbortController.current) {
      generationAbortController.current.abort()
    }
    generationAbortController.current = new AbortController()

    try {
      setState(prev => ({
        ...prev,
        status: 'validating',
        error: null,
        isRegenerating: false
      }))

      // Fetch existing content first
      const existingContent = await fetchExistingContent()

      setState(prev => ({
        ...prev,
        status: 'generating',
        existingContent
      }))

      // Generate content via OpenAI
      const generatedContent = await OpenAIService.generateMeetingNotes({
        transcript,
        additionalNotes,
        date
      })

      setState(prev => ({
        ...prev,
        status: 'processing'
      }))

      // Transform to editable format
      const editableContent = transformToEditableContent(generatedContent)

      setState(prev => ({
        ...prev,
        status: 'success',
        generatedContent: editableContent,
        lastGeneratedAt: new Date(),
        tokenUsage: undefined // OpenAI service could provide this in the future
      }))

      toast.success('Meeting notes and action items generated successfully!')

    } catch (error) {
      console.error('Generation failed:', error)
      const aiError = error as AIServiceError
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: aiError
      }))

      // Show appropriate error message
      if (aiError.retryable) {
        toast.error(`Generation failed: ${aiError.message}. Please try again.`)
      } else {
        toast.error(`Generation failed: ${aiError.message}`)
      }
    }
  }, [fetchExistingContent])

  // Regenerate all content with user confirmation
  const regenerateAll = useCallback(async (
    transcript?: string,
    additionalNotes?: string
  ): Promise<void> => {
    if (!transcript) {
      toast.error('No transcript available for regeneration')
      return
    }

    // Clear old content and reset to initial generation state
    setState(prev => ({
      ...prev,
      status: 'validating',
      generatedContent: null, // Clear old generated content
      error: null,
      isRegenerating: true
    }))

    try {
      // Use the existing generateNotes function to regenerate
      await generateNotes(transcript, additionalNotes || '', selectedDate)
    } catch (error) {
      console.error('Regeneration failed:', error)
      // Error handling is already done in generateNotes
    } finally {
      setState(prev => ({
        ...prev,
        isRegenerating: false
      }))
    }
  }, [generateNotes, selectedDate])

  // Edit individual content items
  const editContent = useCallback((
    pillar: PillarType,
    type: 'note' | 'action_item',
    id: string,
    field: string,
    value: string
  ): void => {
    setState(prev => {
      if (!prev.generatedContent) return prev

      const updatedContent = { ...prev.generatedContent }
      
      if (type === 'note') {
        const noteIndex = updatedContent[pillar].meeting_notes.findIndex(note => note.id === id)
        if (noteIndex !== -1) {
          updatedContent[pillar].meeting_notes[noteIndex] = {
            ...updatedContent[pillar].meeting_notes[noteIndex],
            [field]: value,
            isEdited: true
          }
        }
      } else if (type === 'action_item') {
        const itemIndex = updatedContent[pillar].action_items.findIndex(item => item.id === id)
        if (itemIndex !== -1) {
          updatedContent[pillar].action_items[itemIndex] = {
            ...updatedContent[pillar].action_items[itemIndex],
            [field]: value,
            isEdited: true
          }
        }
      }

      return {
        ...prev,
        generatedContent: updatedContent
      }
    })
  }, [])

  // Delete individual content items
  const deleteContent = useCallback((
    pillar: PillarType,
    type: 'note' | 'action_item',
    id: string
  ): void => {
    setState(prev => {
      if (!prev.generatedContent) return prev

      const updatedContent = { ...prev.generatedContent }
      
      if (type === 'note') {
        updatedContent[pillar].meeting_notes = updatedContent[pillar].meeting_notes.filter(note => note.id !== id)
      } else if (type === 'action_item') {
        updatedContent[pillar].action_items = updatedContent[pillar].action_items.filter(item => item.id !== id)
      }

      return {
        ...prev,
        generatedContent: updatedContent
      }
    })
  }, [])

  // Mutation for approving and persisting all content
  const approveAllMutation = useMutation({
    mutationFn: async (content: EditableGeneratedContent): Promise<void> => {
      const batchRequest = transformToPersistableFormat(content, selectedDate)
      
      // Use existing Supabase patterns with individual operations
      await batchInsertUsingExistingPatterns(batchRequest)
    },
    onSuccess: () => {
      // Invalidate queries following existing patterns
      // Invalidate all pillar-specific queries for the current date
      PILLARS.forEach(pillar => {
        queryClient.invalidateQueries({ queryKey: ['meeting-note', pillar, selectedDate] })
        queryClient.invalidateQueries({ queryKey: ['action-items', pillar, selectedDate] })
      })
      
      // Also invalidate any general queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['meeting-note'] })
      queryClient.invalidateQueries({ queryKey: ['action-items'] })
      
      // Reset generation state
      setState(prev => ({
        ...prev,
        status: 'idle',
        generatedContent: null,
        error: null
      }))

      toast.success('All meeting notes and action items have been saved successfully!')
    },
    onError: (error) => {
      console.error('Failed to save content:', error)
      toast.error('Failed to save content. Please try again.')
    }
  })

  // Approve all generated content
  const approveAll = useCallback(async (): Promise<void> => {
    if (!state.generatedContent) {
      toast.error('No content to approve')
      return
    }

    approveAllMutation.mutate(state.generatedContent)
  }, [state.generatedContent, approveAllMutation])

  // Reset generation state
  const resetGeneration = useCallback((): void => {
    if (generationAbortController.current) {
      generationAbortController.current.abort()
    }
    
    setState({
      status: 'idle',
      generatedContent: null,
      existingContent: null,
      error: null,
      isRegenerating: false,
      lastGeneratedAt: null,
      tokenUsage: undefined
    })
  }, [])

  // Computed values
  const canGenerate = useMemo(() => {
    return state.status === 'idle' || state.status === 'error'
  }, [state.status])

  const hasExistingData = useMemo(() => {
    return state.existingContent?.hasExistingData ?? false
  }, [state.existingContent])

  return {
    state,
    generateNotes,
    regenerateAll,
    editContent,
    deleteContent,
    approveAll,
    resetGeneration,
    canGenerate,
    hasExistingData
  } as UseAIGenerationReturn
}

// Helper function to transform generated content to editable format
const transformToEditableContent = (content: GeneratedContent): EditableGeneratedContent => {
  const editable: EditableGeneratedContent = {
    safety: { meeting_notes: [], action_items: [] },
    quality: { meeting_notes: [], action_items: [] },
    cost: { meeting_notes: [], action_items: [] },
    delivery: { meeting_notes: [], action_items: [] },
    inventory: { meeting_notes: [], action_items: [] },
    production: { meeting_notes: [], action_items: [] },
    people: { meeting_notes: [], action_items: [] }
  }

  for (const pillar of PILLARS) {
    // Transform meeting notes (with safety check)
    const pillarContent = content[pillar]
    if (pillarContent && pillarContent.meeting_notes) {
      editable[pillar].meeting_notes = pillarContent.meeting_notes.map((note, index) => ({
        id: `${pillar}-note-${index}-${Date.now()}`,
        content: note,
        isEdited: false
      }))
    }

    // Transform action items (with safety check)
    if (pillarContent && pillarContent.action_items) {
      editable[pillar].action_items = pillarContent.action_items.map((item, index) => ({
        id: `${pillar}-action-${index}-${Date.now()}`,
        description: item,
        assignee: '', // User will need to fill this in
        priority: 'Medium' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
        isEdited: false
      }))
    }
  }

  return editable
}

// Helper function to transform editable content to persistable format
const transformToPersistableFormat = (content: EditableGeneratedContent, date: string): BatchPersistRequest => {
  const notes: PersistableNote[] = []
  const actionItems: PersistableActionItem[] = []

  for (const pillar of PILLARS) {
    // Only create a note if there are actual meeting notes
    if (content[pillar].meeting_notes.length > 0) {
      const keyPoints = content[pillar].meeting_notes
        .map(note => note.content.trim())
        .filter(content => content.length > 0)
        .join('\n')

      if (keyPoints) {
        notes.push({
          pillar,
          note_date: date,
          key_points: keyPoints
        })
      }
    }

    // Add all action items
    for (const item of content[pillar].action_items) {
      if (item.description.trim()) {
        actionItems.push({
          pillar,
          item_date: date,
          description: item.description.trim(),
          assignee: item.assignee.trim() || null,
          priority: item.priority,
          status: 'Open', // Default status
          due_date: item.dueDate || null
        })
      }
    }
  }

  return { notes, actionItems, date }
}

// Batch insert using existing Supabase patterns
const batchInsertUsingExistingPatterns = async (batchRequest: BatchPersistRequest): Promise<void> => {
  try {
    // Step 1: Clear existing data for this date (following existing patterns)
    const deletePromises = []
    
    if (batchRequest.notes.length > 0) {
      deletePromises.push(
        supabase.from('meeting_notes').delete().eq('note_date', batchRequest.date)
      )
    }
    
    if (batchRequest.actionItems.length > 0) {
      deletePromises.push(
        supabase.from('action_items').delete().eq('item_date', batchRequest.date)
      )
    }

    // Wait for all deletions to complete
    if (deletePromises.length > 0) {
      const deleteResults = await Promise.all(deletePromises)
      deleteResults.forEach(result => {
        if (result.error) {
          console.warn('Non-critical deletion error:', result.error.message)
          // Don't throw - existing data might not exist, which is fine
        }
      })
    }

    // Step 2: Insert new data using existing patterns
    const insertPromises = []

    // Insert meeting notes (following usePillarData pattern)
    if (batchRequest.notes.length > 0) {
      insertPromises.push(
        supabase
          .from('meeting_notes')
          .insert(batchRequest.notes.map(note => ({
            ...note,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })))
          .select()
      )
    }

    // Insert action items (following usePillarData pattern)
    if (batchRequest.actionItems.length > 0) {
      insertPromises.push(
        supabase
          .from('action_items')
          .insert(batchRequest.actionItems.map(item => ({
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })))
          .select()
      )
    }

    // Wait for all insertions to complete
    if (insertPromises.length > 0) {
      const insertResults = await Promise.all(insertPromises)
      insertResults.forEach(result => {
        if (result.error) {
          throw new Error(`Failed to insert data: ${result.error.message}`)
        }
      })
    }

    console.log(`Successfully saved ${batchRequest.notes.length} notes and ${batchRequest.actionItems.length} action items`)
    
  } catch (error) {
    console.error('Batch insert failed:', error)
    throw new Error(`Failed to save meeting data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
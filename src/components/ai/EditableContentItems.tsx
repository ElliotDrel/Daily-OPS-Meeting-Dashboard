// Editable Content Items - Inline editing components for meeting notes and action items
// Provides smooth editing experience with real-time validation and accessibility

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Edit3, 
  Check, 
  X, 
  Calendar, 
  User, 
  Flag,
  FileText,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'

// Editable Meeting Note Component
export const EditableNoteItem: React.FC<{
  id: string
  content: string
  isEdited: boolean
  onEdit: (field: string, value: string) => void
  onDelete: () => void
}> = ({ id, content, isEdited, onEdit, onDelete }) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editValue, setEditValue] = useState(content)
  const [hasError, setHasError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle entering edit mode
  const enterEditMode = useCallback(() => {
    setIsEditMode(true)
    setEditValue(content)
    setHasError(false)
  }, [content])

  // Handle saving changes
  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim()
    
    if (!trimmedValue) {
      setHasError(true)
      return
    }

    onEdit('content', trimmedValue)
    setIsEditMode(false)
    setHasError(false)
  }, [editValue, onEdit])

  // Handle canceling changes
  const handleCancel = useCallback(() => {
    setEditValue(content)
    setIsEditMode(false)
    setHasError(false)
  }, [content])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }, [handleSave, handleCancel])

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditMode && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditMode])

  return (
    <motion.div
      layout
      className={cn(
        'group border rounded-lg transition-all duration-200',
        isEditMode 
          ? 'bg-blue-50 border-blue-300 shadow-sm' 
          : isEdited 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="p-3">
        {isEditMode ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`note-${id}`} className="text-sm font-medium text-gray-700">
                Meeting Note Content
              </Label>
              <Textarea
                ref={textareaRef}
                id={`note-${id}`}
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value)
                  setHasError(false)
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  'mt-1 min-h-[80px] resize-none',
                  hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter meeting note content..."
                aria-describedby={hasError ? `note-${id}-error` : undefined}
              />
              {hasError && (
                <p id={`note-${id}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Note content cannot be empty
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Press Ctrl+Enter to save, Esc to cancel
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-7 px-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editValue.trim()}
                  className="h-7 px-2"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-900 leading-relaxed">
                  {content}
                </p>
              </div>
              {isEdited && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Edited
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={enterEditMode}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                aria-label="Edit note"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Delete note"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Editable Action Item Component
export const EditableActionItem: React.FC<{
  id: string
  description: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  dueDate: string
  isEdited: boolean
  onEdit: (field: string, value: string) => void
  onDelete: () => void
}> = ({ id, description, assignee, priority, dueDate, isEdited, onEdit, onDelete }) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editValues, setEditValues] = useState({
    description,
    assignee,
    priority,
    dueDate
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Handle entering edit mode
  const enterEditMode = useCallback(() => {
    setIsEditMode(true)
    setEditValues({ description, assignee, priority, dueDate })
    setErrors({})
  }, [description, assignee, priority, dueDate])

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!editValues.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (editValues.dueDate) {
      const date = parseISO(editValues.dueDate)
      if (!isValid(date)) {
        newErrors.dueDate = 'Invalid date format'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [editValues])

  // Handle saving changes
  const handleSave = useCallback(() => {
    if (!validateForm()) return

    // Update all fields that have changed
    Object.entries(editValues).forEach(([field, value]) => {
      const currentValue = { description, assignee, priority, dueDate }[field as keyof typeof currentValue]
      if (value !== currentValue) {
        onEdit(field, value)
      }
    })

    setIsEditMode(false)
    setErrors({})
  }, [editValues, validateForm, onEdit, description, assignee, priority, dueDate])

  // Handle canceling changes
  const handleCancel = useCallback(() => {
    setEditValues({ description, assignee, priority, dueDate })
    setIsEditMode(false)
    setErrors({})
  }, [description, assignee, priority, dueDate])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }, [handleSave, handleCancel])

  // Auto-focus description field when entering edit mode
  useEffect(() => {
    if (isEditMode && descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [isEditMode])

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200'
    }
    return styles[priority as keyof typeof styles] || styles.Medium
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date'
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date'
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <motion.div
      layout
      className={cn(
        'group border rounded-lg transition-all duration-200',
        isEditMode 
          ? 'bg-green-50 border-green-300 shadow-sm' 
          : isEdited 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="p-3">
        {isEditMode ? (
          <div className="space-y-4">
            {/* Description Field */}
            <div>
              <Label htmlFor={`action-desc-${id}`} className="text-sm font-medium text-gray-700">
                Description *
              </Label>
              <Textarea
                ref={descriptionRef}
                id={`action-desc-${id}`}
                value={editValues.description}
                onChange={(e) => {
                  setEditValues(prev => ({ ...prev, description: e.target.value }))
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }))
                  }
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  'mt-1 min-h-[60px] resize-none',
                  errors.description && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                )}
                placeholder="Describe the action item..."
                aria-describedby={errors.description ? `action-desc-${id}-error` : undefined}
              />
              {errors.description && (
                <p id={`action-desc-${id}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Assignee Field */}
              <div>
                <Label htmlFor={`action-assignee-${id}`} className="text-sm font-medium text-gray-700">
                  Assignee
                </Label>
                <Input
                  id={`action-assignee-${id}`}
                  value={editValues.assignee}
                  onChange={(e) => setEditValues(prev => ({ ...prev, assignee: e.target.value }))}
                  className="mt-1"
                  placeholder="Who's responsible?"
                />
              </div>

              {/* Priority Field */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Priority
                </Label>
                <Select
                  value={editValues.priority}
                  onValueChange={(value) => setEditValues(prev => ({ ...prev, priority: value as 'High' | 'Medium' | 'Low' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date Field */}
              <div>
                <Label htmlFor={`action-date-${id}`} className="text-sm font-medium text-gray-700">
                  Due Date
                </Label>
                <Input
                  id={`action-date-${id}`}
                  type="date"
                  value={editValues.dueDate}
                  onChange={(e) => {
                    setEditValues(prev => ({ ...prev, dueDate: e.target.value }))
                    if (errors.dueDate) {
                      setErrors(prev => ({ ...prev, dueDate: '' }))
                    }
                  }}
                  className={cn(
                    'mt-1',
                    errors.dueDate && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  )}
                  aria-describedby={errors.dueDate ? `action-date-${id}-error` : undefined}
                />
                {errors.dueDate && (
                  <p id={`action-date-${id}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Press Ctrl+Enter to save, Esc to cancel
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-7 px-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editValues.description.trim()}
                  className="h-7 px-2"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Description */}
              <div className="text-sm font-medium text-gray-900 leading-relaxed">
                {description}
              </div>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                {assignee && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{assignee}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  <Badge variant="outline" className={cn('text-xs h-4', getPriorityBadge(priority))}>
                    {priority}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(dueDate)}</span>
                </div>
              </div>

              {isEdited && (
                <Badge variant="secondary" className="text-xs">
                  Edited
                </Badge>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={enterEditMode}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                aria-label="Edit action item"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Delete action item"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
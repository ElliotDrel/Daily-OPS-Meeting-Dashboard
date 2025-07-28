import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { PillarQuestion, PillarResponse, PillarType, QuestionFormData } from "@/types/pillarData"
import { ClipboardList, CheckCircle } from "lucide-react"

interface DataCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  pillarName: string
  pillar: PillarType
  date: string
  questions: PillarQuestion[]
  existingResponses: PillarResponse[]
  hasResponses: boolean
  onSubmit: (formData: QuestionFormData) => Promise<void>
  isSubmitting?: boolean
}

// All conditional questions are now handled through database structure
// No need for hardcoded dynamic generation

export const DataCollectionModal = ({
  isOpen,
  onClose,
  pillarName,
  pillar,
  date,
  questions,
  existingResponses,
  hasResponses,
  onSubmit,
  isSubmitting = false
}: DataCollectionModalProps) => {
  const { register, handleSubmit, watch, setValue, reset } = useForm<QuestionFormData>()

  // Initialize form with existing responses
  useEffect(() => {
    if (existingResponses.length > 0) {
      const formData: QuestionFormData = {}
      existingResponses.forEach(response => {
        const question = questions.find(q => q.id === response.question_id)
        if (question) {
          formData[question.question_key] = response.answer
        }
      })
      reset(formData)
    } else {
      reset({})
    }
  }, [existingResponses, questions, reset])

  // Watch for changes in form values to handle conditional logic
  const watchedValues = watch()

  const onFormSubmit = async (formData: QuestionFormData) => {
    try {
      // Validate incident descriptions for safety pillar
      if (pillar === 'safety') {
        const incidentCount = Number(formData['incident_count']) || 0;
        if (incidentCount > 0) {
          const missingDescriptions = [];
          for (let i = 1; i <= incidentCount; i++) {
            const description = formData[`incident_detail_${i}`];
            if (!description || String(description).trim() === '') {
              missingDescriptions.push(i);
            }
          }
          
          if (missingDescriptions.length > 0) {
            alert(`Please provide descriptions for incident(s): ${missingDescriptions.join(', ')}`);
            return;
          }
        }
      }

      logFormData(formData) // Debug logging
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting responses:', error)
    }
  }

  const shouldShowQuestion = (question: PillarQuestion): boolean => {
    if (!question.conditional_parent) return true
    
    const parentValue = watchedValues[question.conditional_parent]
    const conditionalValue = question.conditional_value
    
    // Handle multi-select conditions (parent value is an array)
    if (Array.isArray(parentValue)) {
      // Parse conditional value if it's a JSON string
      const targetValue = typeof conditionalValue === 'string' && conditionalValue.startsWith('"') 
        ? JSON.parse(conditionalValue) 
        : conditionalValue
      return parentValue.includes(targetValue)
    }
    
    // Handle single-select conditions
    // Parse conditional value if it's a JSON string
    const targetValue = typeof conditionalValue === 'string' && conditionalValue.startsWith('"') 
      ? JSON.parse(conditionalValue) 
      : conditionalValue
    return parentValue === targetValue
  }

  // Debug function to log form data
  const logFormData = (formData: QuestionFormData) => {
    console.log('📝 Form submission data:', formData)
    console.log('📊 Watched values:', watchedValues)
    console.log('🔍 Visible questions:', questions.filter(shouldShowQuestion).map(q => q.question_key))
  }

  const renderIncidentDescriptionFields = (incidentCount: number) => {
    if (incidentCount <= 0) return null;

    return (
      <div className="space-y-6">
        {Array.from({ length: incidentCount }, (_, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-sm font-medium" htmlFor={`incident_detail_${index + 1}`}>
              Please describe incident {index + 1} details:
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id={`incident_detail_${index + 1}`}
              value={String(watchedValues[`incident_detail_${index + 1}`] || '')}
              onChange={(e) => setValue(`incident_detail_${index + 1}`, e.target.value)}
              placeholder="Enter your response"
              rows={3}
              required
            />
          </div>
        ))}
      </div>
    );
  };

  const renderQuestionField = (question: PillarQuestion) => {
    const key = question.question_key
    const type = question.question_type
    const options = question.options

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={Boolean(watchedValues[key])}
              onCheckedChange={(checked) => setValue(key, checked)}
            />
            <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Yes
            </Label>
          </div>
        )

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(key, value)} value={String(watchedValues[key] || '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multi_select':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${key}_${option}`}
                  checked={Array.isArray(watchedValues[key]) && watchedValues[key].includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = watchedValues[key] || []
                    const newValue = checked
                      ? [...currentValue, option]
                      : currentValue.filter((v: string) => v !== option)
                    setValue(key, newValue)
                  }}
                />
                <Label htmlFor={`${key}_${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            id={key}
            value={String(watchedValues[key] || '')}
            onChange={(e) => setValue(key, e.target.value ? Number(e.target.value) : '')}
            placeholder="Enter a number"
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={key}
            value={String(watchedValues[key] || '')}
            onChange={(e) => setValue(key, e.target.value)}
            placeholder="Enter your response"
            rows={3}
          />
        )

      case 'text':
      default:
        return (
          <Input
            type="text"
            id={key}
            value={String(watchedValues[key] || '')}
            onChange={(e) => setValue(key, e.target.value)}
            placeholder="Enter your response"
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <DialogTitle>
              {hasResponses ? 'Edit Data Collection' : 'Daily Data Collection'} - {pillarName}
            </DialogTitle>
          </div>
          <DialogDescription>
            {hasResponses 
              ? `Update your responses for ${date}` 
              : `Please provide information for ${pillarName} pillar on ${date}`
            }
          </DialogDescription>
          {hasResponses && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>You have already submitted data for this date</span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {questions.map((question) => {
            if (!shouldShowQuestion(question)) return null

            return (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.question_key} className="text-sm font-medium">
                  {question.question_text}
                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderQuestionField(question)}
                
                {/* Render dynamic incident description fields for safety pillar */}
                {question.question_key === 'incident_count' && pillar === 'safety' && (
                  renderIncidentDescriptionFields(Number(watchedValues['incident_count']) || 0)
                )}
              </div>
            )
          })}

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : hasResponses ? 'Update Responses' : 'Submit Responses'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
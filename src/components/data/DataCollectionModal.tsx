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

// Generate dynamic Safety incident questions based on count
const generateIncidentQuestions = (count: string): Array<{ key: string; text: string; type: 'textarea'; required: boolean }> => {
  const incidentCount = count === '6+' ? 6 : parseInt(count)
  const questions = []
  for (let i = 1; i <= incidentCount; i++) {
    questions.push({
      key: `incident_detail_${i}`,
      text: `Describe incident ${i}:`,
      type: 'textarea' as const,
      required: true
    })
  }
  return questions
}

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
  const [dynamicQuestions, setDynamicQuestions] = useState<Array<{ key: string; text: string; type: string; required: boolean }>>([])

  // Initialize form with existing responses
  useEffect(() => {
    if (existingResponses.length > 0) {
      const formData: QuestionFormData = {}
      existingResponses.forEach(response => {
        const question = questions.find(q => q.id === response.question_id)
        if (question) {
          // Handle incident_count with embedded details
          if (question.question_key === 'incident_count' && typeof response.answer === 'object' && response.answer !== null) {
            const answerObj = response.answer as { count?: unknown; details?: Record<string, unknown> }
            
            // Set the count value (handle both string and object formats)
            if (answerObj.count !== undefined) {
              formData[question.question_key] = answerObj.count
            } else {
              // Fallback for old format
              formData[question.question_key] = response.answer
            }
            
            // Extract and populate incident details
            if (answerObj.details) {
              Object.entries(answerObj.details).forEach(([detailKey, detailValue]) => {
                formData[detailKey] = detailValue
              })
            }
          } else {
            formData[question.question_key] = response.answer
          }
        }
      })
      reset(formData)
    } else {
      reset({})
    }
  }, [existingResponses, questions, reset])

  // Watch for changes in conditional questions (e.g., Safety incidents)
  const watchedValues = watch()

  useEffect(() => {
    if (pillar === 'safety' && watchedValues.incident_count && watchedValues.incident_count !== '0') {
      const incidentQuestions = generateIncidentQuestions(watchedValues.incident_count)
      setDynamicQuestions(incidentQuestions)
    } else {
      // Clear dynamic questions and their values when count changes
      setDynamicQuestions([])
      // Clear any existing incident detail values
      for (let i = 1; i <= 6; i++) {
        setValue(`incident_detail_${i}`, '')
      }
    }
  }, [pillar, watchedValues.incident_count, setValue])

  const onFormSubmit = async (formData: QuestionFormData) => {
    try {
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
    return parentValue === question.conditional_value
  }

  // Debug function to log form data
  const logFormData = (formData: QuestionFormData) => {
    console.log('📝 Form submission data:', formData)
    console.log('🔄 Dynamic questions:', dynamicQuestions)
    console.log('📊 Watched values:', watchedValues)
  }

  const renderQuestionField = (question: PillarQuestion | { key: string; text: string; type: string; required: boolean }) => {
    const key = 'id' in question ? question.question_key : question.key
    const text = 'id' in question ? question.question_text : question.text
    const type = 'id' in question ? question.question_type : question.type
    const required = 'id' in question ? question.is_required : question.required
    const options = 'id' in question ? question.options : undefined

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
              </div>
            )
          })}

          {/* Dynamic questions (e.g., Safety incident details) */}
          {dynamicQuestions.map((question) => (
            <div key={question.key} className="space-y-2">
              <Label htmlFor={question.key} className="text-sm font-medium">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderQuestionField(question)}
            </div>
          ))}

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
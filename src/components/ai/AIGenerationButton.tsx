// AI Generation Button - Primary interface for triggering AI-powered meeting notes generation
// Provides clear visual feedback for all generation states with excellent accessibility

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  AIGenerationStatus, 
  AIServiceError,
  AIGenerationButtonProps 
} from '@/types/aiGeneration'

export const AIGenerationButton: React.FC<AIGenerationButtonProps> = ({
  disabled,
  onGenerate,
  status,
  error
}) => {
  // Determine button state and styling
  const getButtonConfig = () => {
    switch (status) {
      case 'idle':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300',
          icon: <Sparkles className="w-5 h-5" />,
          text: 'Generate Meeting Notes & Action Items',
          tooltip: disabled 
            ? 'Please save transcript and additional notes first'
            : 'Generate AI-powered meeting notes and action items from your transcript'
        }
      
      case 'validating':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: 'Validating Prerequisites...',
          tooltip: 'Checking API configuration and prerequisites'
        }
      
      case 'generating':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
          icon: <Bot className="w-5 h-5 animate-pulse" />,
          text: 'AI is Generating Content...',
          tooltip: 'AI is analyzing your transcript and generating structured notes'
        }
      
      case 'processing':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: 'Processing Response...',
          tooltip: 'Validating and organizing the generated content'
        }
      
      case 'success':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Generation Complete!',
          tooltip: 'Content generated successfully. Review and approve below.'
        }
      
      case 'error':
        return {
          variant: 'destructive' as const,
          className: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white',
          icon: <AlertCircle className="w-5 h-5" />,
          text: error?.retryable ? 'Retry Generation' : 'Generation Failed',
          tooltip: error?.message || 'An error occurred during generation'
        }
      
      case 'regenerating':
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-orange-600 to-red-600 text-white',
          icon: <RefreshCw className="w-5 h-5 animate-spin" />,
          text: 'Regenerating All Content...',
          tooltip: 'Generating fresh content. Previous content will be replaced.'
        }
      
      default:
        return {
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
          icon: <Bot className="w-5 h-5" />,
          text: 'Generate Meeting Notes',
          tooltip: 'Generate AI-powered meeting notes and action items'
        }
    }
  }

  const config = getButtonConfig()
  const isLoading = ['validating', 'generating', 'processing', 'regenerating'].includes(status)
  const isDisabled = disabled || isLoading

  // Handle click with proper error handling
  const handleClick = async () => {
    if (isDisabled) return
    
    try {
      await onGenerate()
    } catch (error) {
      console.error('Generation failed:', error)
      // Error handling is managed by the hook
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center">
            <motion.div
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleClick}
                disabled={isDisabled}
                size="lg"
                variant={config.variant}
                className={`
                  min-w-[280px] h-12 font-semibold text-base rounded-lg
                  ${config.className}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  transition-all duration-300 ease-in-out
                  focus:ring-4 focus:ring-blue-200 focus:outline-none
                  disabled:hover:scale-100
                `}
                aria-label={config.tooltip}
                aria-describedby={error ? 'generation-error' : undefined}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    {config.icon}
                    <span>{config.text}</span>
                  </motion.div>
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-xs text-center p-3"
          sideOffset={8}
        >
          <p className="text-sm">{config.tooltip}</p>
          {error && error.retryable && (
            <p className="text-xs mt-1 text-blue-200">
              Click to retry the generation
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Loading indicator component for when generation is in progress
export const AIGenerationProgress: React.FC<{
  status: AIGenerationStatus
  error: AIServiceError | null
}> = ({ status, error }) => {
  if (!['validating', 'generating', 'processing', 'regenerating'].includes(status)) {
    return null
  }

  const getProgressConfig = () => {
    switch (status) {
      case 'validating':
        return {
          message: 'Checking prerequisites and API configuration...',
          progress: 10
        }
      case 'generating':
        return {
          message: 'AI is analyzing your transcript and generating content...',
          progress: 50
        }
      case 'processing':
        return {
          message: 'Validating and organizing the generated content...',
          progress: 80
        }
      case 'regenerating':
        return {
          message: 'Regenerating all content with fresh AI analysis...',
          progress: 60
        }
      default:
        return {
          message: 'Processing...',
          progress: 0
        }
    }
  }

  const config = getProgressConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          {config.message}
        </span>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${config.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      <p className="text-xs text-blue-700 mt-2 text-center">
        This may take 30-60 seconds depending on transcript length
      </p>
    </motion.div>
  )
}

// Error display component
export const AIGenerationError: React.FC<{
  error: AIServiceError
  onRetry?: () => void
}> = ({ error, onRetry }) => {
  const getErrorConfig = () => {
    switch (error.type) {
      case 'api_key_missing':
      case 'api_key_invalid':
        return {
          title: 'API Configuration Error',
          message: 'OpenAI API key is not properly configured. Please contact your administrator.',
          actionable: false
        }
      
      case 'rate_limit_exceeded':
        return {
          title: 'Rate Limit Exceeded',
          message: `Too many requests. Please wait ${error.retryAfter || 60} seconds before trying again.`,
          actionable: true
        }
      
      case 'network_error':
        return {
          title: 'Network Error',
          message: 'Unable to connect to AI service. Please check your internet connection and try again.',
          actionable: true
        }
      
      case 'content_too_long':
        return {
          title: 'Content Too Long',
          message: 'The transcript is too long for processing. Please try with a shorter transcript.',
          actionable: false
        }
      
      case 'insufficient_quota':
        return {
          title: 'API Quota Exceeded',
          message: 'AI service quota has been exceeded. Please contact your administrator.',
          actionable: false
        }
      
      default:
        return {
          title: 'Generation Failed',
          message: error.message || 'An unexpected error occurred during generation.',
          actionable: error.retryable
        }
    }
  }

  const config = getErrorConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
      id="generation-error"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-1">
            {config.title}
          </h4>
          <p className="text-sm text-red-800 mb-3">
            {config.message}
          </p>
          
          {config.actionable && onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
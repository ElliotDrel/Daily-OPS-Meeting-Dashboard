// OpenAI Service - AI-powered meeting notes and action items generation
// Handles OpenAI API integration with comprehensive error handling and response validation

import {
  OpenAIConfig,
  GeneratedContent,
  AIServiceError,
  AIErrorType,
  GenerateNotesRequest,
  OpenAIResponse,
  GeneratedContentValidation,
  PILLARS
} from '@/types/aiGeneration'

export class OpenAIService {
  private static config: OpenAIConfig = {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1',
    maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '10000'),
    temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.3'),
    timeout: parseInt(import.meta.env.VITE_OPENAI_TIMEOUT || '60000')
  }

  /**
   * Generate meeting notes and action items from transcript and additional notes
   */
  static async generateMeetingNotes(request: GenerateNotesRequest): Promise<GeneratedContent> {
    try {
      // Validate prerequisites
      await this.validatePrerequisites()

      // Generate the prompt
      const prompt = this.buildPrompt(request.transcript, request.additionalNotes, request.date)

      // Make API request with retry logic
      const response = await this.makeAPIRequest(prompt)

      // Parse and validate response
      const generatedContent = this.parseAndValidateResponse(response)

      return generatedContent
    } catch (error) {
      console.error('OpenAI generation failed:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Validate API key and basic configuration
   */
  static async validatePrerequisites(): Promise<void> {
    if (!this.config.apiKey) {
      throw this.createError('api_key_missing', 'OpenAI API key is not configured', false)
    }

    if (this.config.apiKey.length < 20 || !this.config.apiKey.startsWith('sk-')) {
      throw this.createError('api_key_invalid', 'OpenAI API key format is invalid', false)
    }
  }

  /**
   * Build the comprehensive prompt for meeting notes generation
   */
  private static buildPrompt(transcript: string, additionalNotes: string, date: string): string {
    return `You are an AI assistant specialized in generating structured meeting notes and action items from daily operations meeting transcripts.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON in the exact format specified below
2. Do NOT include any text before or after the JSON
3. Generate content for ALL 7 pillars even if not explicitly mentioned in the transcript
4. If a pillar has no relevant content, use empty arrays for that pillar

INPUT DATA:
Date: ${date}
Transcript: ${transcript}
Additional Notes: ${additionalNotes || 'None provided'}

OUTPUT FORMAT (respond with ONLY this JSON structure):
{
  "safety": {
    "meeting_notes": ["Safety-related note 1", "Safety-related note 2"],
    "action_items": ["Safety action item 1", "Safety action item 2"]
  },
  "quality": {
    "meeting_notes": ["Quality-related note 1", "Quality-related note 2"],
    "action_items": ["Quality action item 1", "Quality action item 2"]
  },
  "cost": {
    "meeting_notes": ["Cost-related note 1", "Cost-related note 2"],
    "action_items": ["Cost action item 1", "Cost action item 2"]
  },
  "delivery": {
    "meeting_notes": ["Delivery-related note 1", "Delivery-related note 2"],
    "action_items": ["Delivery action item 1", "Delivery action item 2"]
  },
  "inventory": {
    "meeting_notes": ["Inventory-related note 1", "Inventory-related note 2"],
    "action_items": ["Inventory action item 1", "Inventory action item 2"]
  },
  "production": {
    "meeting_notes": ["Production-related note 1", "Production-related note 2"],
    "action_items": ["Production action item 1", "Production action item 2"]
  },
  "people": {
    "meeting_notes": ["People-related note 1", "People-related note 2"],
    "action_items": ["People action item 1", "People action item 2"]
  }
}

PILLAR DEFINITIONS:
- Safety: Workplace safety, incidents, safety protocols, PPE, training, compliance
- Quality: Product quality, defects, quality control, testing, standards, customer feedback
- Cost: Expenses, budget, cost reduction, financial metrics, spending, ROI
- Delivery: Shipping, logistics, on-time delivery, transportation, customer delivery
- Inventory: Stock levels, warehouse, materials, supply chain, inventory management
- Production: Manufacturing, output, capacity, efficiency, production metrics, equipment
- People: Workforce, staffing, training, employee performance, attendance, HR issues, team dynamics

GENERATION RULES:
1. Extract relevant information from the transcript and additional notes
2. Categorize each piece of information into the appropriate pillar
3. Create concise, actionable meeting notes (1-2 sentences each)
4. Generate specific, measurable action items with clear deliverables
5. Use professional, clear language
6. If no content exists for a pillar, use empty arrays: []
7. Ensure all action items are actionable and specific
8. Focus on key decisions, updates, concerns, and next steps

Remember: Respond with ONLY the JSON object, no additional text.`
  }

  /**
   * Make the API request to OpenAI with retry logic
   */
  private static async makeAPIRequest(prompt: string): Promise<OpenAIResponse> {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          await this.handleAPIError(response, attempt, maxRetries)
          attempt++
          continue
        }

        const data: OpenAIResponse = await response.json()
        return data

      } catch (error) {
        attempt++
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw this.createError('timeout_error', 'Request timed out', true)
        }

        if (attempt >= maxRetries) {
          throw this.createError('network_error', `Network error after ${maxRetries} attempts: ${error}`, false)
        }

        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000)
      }
    }

    throw this.createError('unknown_error', 'Maximum retry attempts exceeded', false)
  }

  /**
   * Handle API error responses
   */
  private static async handleAPIError(response: Response, attempt: number, maxRetries: number): Promise<void> {
    let errorData: Record<string, unknown> = {}
    
    try {
      errorData = await response.json()
    } catch {
      // If we can't parse the error response, use the status
    }

    const errorObj = errorData?.error as Record<string, unknown> | undefined
    const errorMessage = errorObj?.message as string || `HTTP ${response.status}: ${response.statusText}`

    switch (response.status) {
      case 401:
        throw this.createError('api_key_invalid', 'Invalid API key', false)
      
      case 429: {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60')
        if (attempt < maxRetries - 1) {
          await this.delay(retryAfter * 1000)
          return // Continue with retry
        }
        throw this.createError('rate_limit_exceeded', 'Rate limit exceeded', true, retryAfter)
      }
      
      case 400:
        if (errorMessage.includes('content_too_long') || errorMessage.includes('token')) {
          throw this.createError('content_too_long', 'Input content exceeds token limit', false)
        }
        throw this.createError('invalid_response', errorMessage, false)
      
      case 402:
        throw this.createError('insufficient_quota', 'Insufficient API quota', false)
      
      case 500:
      case 502:
      case 503:
      case 504:
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt + 1) * 1000)
          return // Continue with retry
        }
        throw this.createError('network_error', `Server error: ${errorMessage}`, true)
      
      default:
        throw this.createError('unknown_error', errorMessage, false)
    }
  }

  /**
   * Parse and validate the OpenAI response
   */
  private static parseAndValidateResponse(response: OpenAIResponse): GeneratedContent {
    try {
      if (!response.choices || response.choices.length === 0) {
        throw this.createError('invalid_response', 'No choices in API response', false)
      }

      const content = response.choices[0].message.content
      if (!content) {
        throw this.createError('invalid_response', 'Empty content in API response', false)
      }

      // Parse JSON
      let parsedContent: unknown
      try {
        parsedContent = JSON.parse(content)
      } catch (error) {
        throw this.createError('json_parse_error', `Failed to parse JSON: ${error}`, false)
      }

      // Validate structure
      const validation = this.validateGeneratedContent(parsedContent)
      if (!validation.isValid) {
        console.warn('Generated content validation warnings:', validation.warnings)
        
        if (validation.errors.length > 0) {
          throw this.createError('invalid_response', `Invalid content structure: ${validation.errors.join(', ')}`, false)
        }

        // Use partial content if available
        if (validation.partialContent) {
          return this.normalizeGeneratedContent(validation.partialContent)
        }
      }

      return this.normalizeGeneratedContent(parsedContent)

    } catch (error) {
      if (error instanceof Error && error.message.includes('AIServiceError')) {
        throw error
      }
      throw this.createError('json_parse_error', `Response parsing failed: ${error}`, false)
    }
  }

  /**
   * Validate the generated content structure
   */
  private static validateGeneratedContent(content: unknown): GeneratedContentValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const partialContent: Partial<GeneratedContent> = {}

    if (typeof content !== 'object' || content === null) {
      errors.push('Content must be an object')
      return { isValid: false, errors, warnings }
    }

    // Validate each pillar
    const contentObj = content as Record<string, unknown>
    for (const pillar of PILLARS) {
      if (!(pillar in contentObj)) {
        warnings.push(`Missing pillar: ${pillar}`)
        continue
      }

      const pillarContent = contentObj[pillar]
      if (typeof pillarContent !== 'object' || pillarContent === null) {
        warnings.push(`Invalid pillar content for ${pillar}`)
        continue
      }

      const pillarObj = pillarContent as Record<string, unknown>

      // Validate meeting_notes
      if (!Array.isArray(pillarObj.meeting_notes)) {
        warnings.push(`Invalid meeting_notes for ${pillar}`)
      }

      // Validate action_items
      if (!Array.isArray(pillarObj.action_items)) {
        warnings.push(`Invalid action_items for ${pillar}`)
      }

      // Add to partial content if structure is correct
      if (Array.isArray(pillarObj.meeting_notes) && Array.isArray(pillarObj.action_items)) {
        partialContent[pillar as keyof GeneratedContent] = {
          meeting_notes: pillarObj.meeting_notes.filter((note: unknown) => typeof note === 'string'),
          action_items: pillarObj.action_items.filter((item: unknown) => typeof item === 'string')
        }
      }
    }

    const isValid = errors.length === 0
    return { isValid, errors, warnings, partialContent }
  }

  /**
   * Normalize generated content to ensure all pillars are present
   */
  private static normalizeGeneratedContent(content: Partial<GeneratedContent>): GeneratedContent {
    const normalized: GeneratedContent = {
      safety: { meeting_notes: [], action_items: [] },
      quality: { meeting_notes: [], action_items: [] },
      cost: { meeting_notes: [], action_items: [] },
      delivery: { meeting_notes: [], action_items: [] },
      inventory: { meeting_notes: [], action_items: [] },
      production: { meeting_notes: [], action_items: [] },
      people: { meeting_notes: [], action_items: [] }
    }

    // Merge provided content
    for (const pillar of PILLARS) {
      if (content[pillar]) {
        normalized[pillar] = {
          meeting_notes: content[pillar]?.meeting_notes || [],
          action_items: content[pillar]?.action_items || []
        }
      }
    }

    return normalized
  }

  /**
   * Create a standardized error object
   */
  private static createError(type: AIErrorType, message: string, retryable: boolean, retryAfter?: number): AIServiceError {
    return {
      type,
      message,
      retryable,
      retryAfter,
      details: { timestamp: new Date().toISOString() }
    }
  }

  /**
   * Handle unknown errors and convert to AIServiceError
   */
  private static handleError(error: unknown): AIServiceError {
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      return error as AIServiceError
    }

    if (error instanceof Error) {
      return this.createError('unknown_error', error.message, false)
    }

    return this.createError('unknown_error', 'An unexpected error occurred', false)
  }

  /**
   * Utility function for delays
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current configuration (for debugging/monitoring)
   */
  static getConfig(): Omit<OpenAIConfig, 'apiKey'> {
    return {
      apiKey: this.config.apiKey ? '[CONFIGURED]' : '[NOT SET]',
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      timeout: this.config.timeout
    }
  }

  /**
   * Validate API key format without making a request
   */
  static validateAPIKeyFormat(apiKey?: string): boolean {
    const key = apiKey || this.config.apiKey
    return !!(key && key.length > 20 && key.startsWith('sk-'))
  }

  /**
   * Estimate token usage for a prompt (rough estimation)
   */
  static estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }
}
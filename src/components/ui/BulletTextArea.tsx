import { forwardRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface BulletTextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  disabled?: boolean
  onSave?: () => void
}

const BULLET = '• '

export const BulletTextArea = forwardRef<HTMLTextAreaElement, BulletTextAreaProps>(
  ({ value, onChange, placeholder, className, rows = 5, disabled, onSave, ...props }, ref) => {
    
    const formatTextWithBullets = (text: string): string => {
      if (!text.trim()) return BULLET
      
      const lines = text.split('\n')
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return BULLET
        if (trimmedLine.startsWith(BULLET)) return line
        return BULLET + trimmedLine
      })
      
      return formattedLines.join('\n')
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const lines = value.split('\n')
      
      if (e.key === 'Enter') {
        e.preventDefault()
        
        const currentLineIndex = value.substring(0, cursorPosition).split('\n').length - 1
        const currentLine = lines[currentLineIndex] || ''
        const currentLineContent = currentLine.replace(BULLET, '').trim()
        
        if (!currentLineContent && lines.length > 1) {
          const newLines = lines.filter((_, index) => index !== currentLineIndex)
          onChange(newLines.join('\n'))
          return
        }
        
        const beforeCursor = value.substring(0, cursorPosition)
        const afterCursor = value.substring(cursorPosition)
        const newValue = beforeCursor + '\n' + BULLET + afterCursor
        
        onChange(newValue)
        
        setTimeout(() => {
          const newCursorPosition = cursorPosition + 1 + BULLET.length
          textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        }, 0)
      }
      
      if (e.key === 'Backspace') {
        const lines = value.split('\n')
        const currentLineIndex = value.substring(0, cursorPosition).split('\n').length - 1
        const currentLine = lines[currentLineIndex] || ''
        const positionInLine = cursorPosition - value.substring(0, value.lastIndexOf('\n', cursorPosition - 1) + 1).length
        
        if (positionInLine <= BULLET.length && currentLine.startsWith(BULLET)) {
          if (lines.length === 1) {
            e.preventDefault()
            return
          }
          
          if (currentLine === BULLET) {
            e.preventDefault()
            const newLines = lines.filter((_, index) => index !== currentLineIndex)
            onChange(newLines.join('\n'))
            
            setTimeout(() => {
              const previousLineEnd = newLines.slice(0, currentLineIndex).join('\n').length
              const newCursorPosition = Math.max(0, previousLineEnd)
              textarea.setSelectionRange(newCursorPosition, newCursorPosition)
            }, 0)
          }
        }
      }
      
      if (e.ctrlKey && e.key === 'Enter' && onSave) {
        e.preventDefault()
        onSave()
      }
    }

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      onChange(newValue)
    }

    const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData('text')
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const selectionEnd = textarea.selectionEnd
      
      const beforeSelection = value.substring(0, cursorPosition)
      const afterSelection = value.substring(selectionEnd)
      
      const formattedPastedText = formatTextWithBullets(pastedText)
      const newValue = beforeSelection + formattedPastedText + afterSelection
      
      onChange(newValue)
      
      setTimeout(() => {
        const newCursorPosition = cursorPosition + formattedPastedText.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
      }, 0)
    }

    const displayValue = value || BULLET

    return (
      <textarea
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          className
        )}
        style={{
          fontFamily: 'ui-monospace, "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
          lineHeight: '1.5'
        }}
        {...props}
      />
    )
  }
)

BulletTextArea.displayName = 'BulletTextArea'
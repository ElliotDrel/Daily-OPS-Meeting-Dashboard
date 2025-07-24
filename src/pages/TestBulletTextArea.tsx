import { useState } from 'react'
import { BulletTextArea } from '@/components/ui/BulletTextArea'
import { Button } from '@/components/ui/button'

export const TestBulletTextArea = () => {
  const [value, setValue] = useState('')
  const [savedValue, setSavedValue] = useState('')

  const handleSave = () => {
    setSavedValue(value)
    console.log('Saved value:', value)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">BulletTextArea Test Page</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test Component</h2>
          <BulletTextArea
            value={value}
            onChange={setValue}
            placeholder="Start typing your bullet points..."
            className="w-full max-w-2xl"
            rows={8}
            onSave={handleSave}
          />
          <Button onClick={handleSave} className="mt-2">
            Save Notes
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Test Instructions</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Press Enter to create new bullet points</li>
            <li>• Try pasting text with/without bullets</li>
            <li>• Try deleting bullets (should be prevented)</li>
            <li>• Try Ctrl+Enter to save</li>
            <li>• Empty lines should be removed when pressing Enter</li>
          </ul>
        </div>

        {savedValue && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Saved Value</h2>
            <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
              {savedValue}
            </pre>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-2">Raw State Value</h2>
          <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
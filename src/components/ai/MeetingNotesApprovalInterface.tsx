// Meeting Notes Approval Interface - Central component for reviewing and approving AI-generated content
// Provides comprehensive approval workflow with editing capabilities and bulk actions

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  ListTodo,
  Eye,
  EyeOff,
  Calendar,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  MeetingNotesApprovalInterfaceProps,
  PillarType,
  PILLARS,
  EditablePillarContent,
  ExistingPillarContent
} from '@/types/aiGeneration'
import { EditableNoteItem, EditableActionItem } from './EditableContentItems'
import { format } from 'date-fns'

export const MeetingNotesApprovalInterface: React.FC<MeetingNotesApprovalInterfaceProps> = ({
  generatedContent,
  existingContent,
  onContentEdit,
  onContentDelete,
  onApproveAll,
  onRegenerateAll,
  isApproving,
  isRegenerating
}) => {
  const [showExistingContent, setShowExistingContent] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)

  // Calculate content statistics
  const contentStats = useMemo(() => {
    let totalNotes = 0
    let totalActionItems = 0
    let editedItems = 0

    for (const pillar of PILLARS) {
      const pillarContent = generatedContent[pillar]
      totalNotes += pillarContent.meeting_notes.length
      totalActionItems += pillarContent.action_items.length
      
      editedItems += pillarContent.meeting_notes.filter(note => note.isEdited).length
      editedItems += pillarContent.action_items.filter(item => item.isEdited).length
    }

    return { totalNotes, totalActionItems, editedItems }
  }, [generatedContent])

  // Handle regenerate confirmation
  const handleRegenerateConfirm = async () => {
    setRegenerateDialogOpen(false)
    await onRegenerateAll()
  }

  // Check if there's existing content to show
  const hasExistingContent = existingContent.hasExistingData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-6 h-6 text-blue-600" />
                AI-Generated Meeting Notes & Action Items
              </CardTitle>
              <CardDescription className="mt-2">
                Review the AI-generated content below. You can edit individual items or regenerate all content.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                Generated {format(new Date(), 'MMM d, h:mm a')}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Content Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{contentStats.totalNotes}</div>
              <div className="text-sm text-blue-600">Meeting Notes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{contentStats.totalActionItems}</div>
              <div className="text-sm text-green-600">Action Items</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">{contentStats.editedItems}</div>
              <div className="text-sm text-amber-600">Edited Items</div>
            </div>
          </div>

          {/* Existing Content Alert */}
          {hasExistingContent && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="flex items-center justify-between">
                  <span>
                    This date already has meeting notes or action items. Approving will replace existing data.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExistingContent(!showExistingContent)}
                    className="ml-4"
                  >
                    {showExistingContent ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide Existing
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        View Existing
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={onApproveAll}
              disabled={isApproving || isRegenerating}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white min-w-[180px]"
            >
              {isApproving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving Content...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve All Content
                </>
              )}
            </Button>

            <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={isApproving || isRegenerating}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 min-w-[180px]"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate All
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Regenerate All Content?</DialogTitle>
                  <DialogDescription>
                    This will replace all current generated content with fresh AI analysis. 
                    Any manual edits you've made will be lost. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setRegenerateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleRegenerateConfirm}
                  >
                    Yes, Regenerate All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Existing Content Display */}
      <AnimatePresence>
        {showExistingContent && hasExistingContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Calendar className="w-5 h-5" />
                  Existing Content (Will be Replaced)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PILLARS.map(pillar => {
                  const existingPillarContent = existingContent[pillar]
                  const hasContent = existingPillarContent.meeting_note || existingPillarContent.action_items.length > 0
                  
                  if (!hasContent) return null

                  return (
                    <div key={pillar} className="p-3 bg-white rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 capitalize mb-2">{pillar}</h4>
                      
                      {existingPillarContent.meeting_note && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-amber-800 mb-1">Meeting Notes:</div>
                          <div className="text-sm text-amber-700 pl-4">
                            {existingPillarContent.meeting_note.keyPoints?.map((point, index) => (
                              <div key={index}>• {point}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {existingPillarContent.action_items.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-amber-800 mb-1">Action Items:</div>
                          <div className="text-sm text-amber-700 pl-4">
                            {existingPillarContent.action_items.map((item, index) => (
                              <div key={index}>• {item.description}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content Sections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-blue-600" />
          Generated Content by Pillar
        </h3>
        
        <Accordion type="multiple" defaultValue={PILLARS} className="space-y-2">
          {PILLARS.map(pillar => (
            <PillarContentSection
              key={pillar}
              pillar={pillar}
              generatedContent={generatedContent[pillar]}
              existingContent={existingContent[pillar]}
              onContentEdit={onContentEdit}
              onContentDelete={onContentDelete}
            />
          ))}
        </Accordion>
      </div>
    </motion.div>
  )
}

// Individual pillar content section component
const PillarContentSection: React.FC<{
  pillar: PillarType
  generatedContent: EditablePillarContent
  existingContent: ExistingPillarContent
  onContentEdit: (pillar: PillarType, type: 'note' | 'action_item', id: string, field: string, value: string) => void
  onContentDelete: (pillar: PillarType, type: 'note' | 'action_item', id: string) => void
}> = ({ pillar, generatedContent, existingContent, onContentEdit, onContentDelete }) => {
  const hasGeneratedContent = generatedContent.meeting_notes.length > 0 || generatedContent.action_items.length > 0
  const hasExistingContent = existingContent.meeting_note || existingContent.action_items.length > 0

  // Get pillar display info
  const getPillarInfo = (pillar: PillarType) => {
    const pillarConfig = {
      safety: { color: 'red', icon: '🛡️', label: 'Safety' },
      quality: { color: 'blue', icon: '⭐', label: 'Quality' },
      cost: { color: 'green', icon: '💰', label: 'Cost' },
      delivery: { color: 'purple', icon: '🚚', label: 'Delivery' },
      inventory: { color: 'orange', icon: '📦', label: 'Inventory' },
      production: { color: 'indigo', icon: '⚙️', label: 'Production' },
      people: { color: 'teal', icon: '👥', label: 'People' }
    }
    
    return pillarConfig[pillar] || { color: 'gray', icon: '📋', label: pillar }
  }

  const pillarInfo = getPillarInfo(pillar)

  if (!hasGeneratedContent && !hasExistingContent) {
    return null
  }

  return (
    <AccordionItem value={pillar} className="border rounded-lg">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-lg">{pillarInfo.icon}</span>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{pillarInfo.label}</div>
              <div className="text-sm text-gray-500">
                {generatedContent.meeting_notes.length} notes, {generatedContent.action_items.length} action items
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasExistingContent && (
              <Badge variant="outline" className="text-xs">
                Has Existing Data
              </Badge>
            )}
            {(generatedContent.meeting_notes.some((n) => n.isEdited) || 
              generatedContent.action_items.some((i) => i.isEdited)) && (
              <Badge variant="secondary" className="text-xs">
                Edited
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {/* Meeting Notes Section */}
          {generatedContent.meeting_notes.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Meeting Notes ({generatedContent.meeting_notes.length})
              </h5>
              <div className="space-y-2">
                {generatedContent.meeting_notes.map((note, index) => (
                  <EditableNoteItem
                    key={note.id}
                    id={note.id}
                    content={note.content}
                    isEdited={note.isEdited}
                    onEdit={(field, value) => onContentEdit(pillar, 'note', note.id, field, value)}
                    onDelete={() => onContentDelete(pillar, 'note', note.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Items Section */}
          {generatedContent.action_items.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                Action Items ({generatedContent.action_items.length})
              </h5>
              <div className="space-y-2">
                {generatedContent.action_items.map((item, index) => (
                  <EditableActionItem
                    key={item.id}
                    id={item.id}
                    description={item.description}
                    assignee={item.assignee}
                    priority={item.priority}
                    dueDate={item.dueDate}
                    isEdited={item.isEdited}
                    onEdit={(field, value) => onContentEdit(pillar, 'action_item', item.id, field, value)}
                    onDelete={() => onContentDelete(pillar, 'action_item', item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {generatedContent.meeting_notes.length === 0 && generatedContent.action_items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No content generated for this pillar</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
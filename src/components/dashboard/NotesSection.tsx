import { BulletTextArea } from "@/components/ui/BulletTextArea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Send, Edit, Trash2, Save, Calendar } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useNotesDisplayLogic } from "@/hooks/useNotesDisplayLogic";
import { useDelayedTooltip } from "@/hooks/useDelayedTooltip";

export interface MeetingNote {
  id: string;
  pillar: string;
  note_date: string;
  key_points: string;
  keyPoints?: string[];
  created_at: string;
  updated_at: string;
}

// Helper function to strip bullets from text
const stripBullets = (text: string): string => {
  return text.replace(/^[•·\-*]\s*/, '').trim();
};

const YesterdayNotesCard = ({ note }: { note: MeetingNote }) => {
  const tooltip = useDelayedTooltip(5000);

  return (
    <Tooltip open={tooltip.isOpen} onOpenChange={(open) => !open && tooltip.handleClose()}>
      <TooltipTrigger asChild>
        <div 
          className="border-x border-muted/50 rounded-lg p-4 bg-background/50 hover:bg-muted/30 transition-colors cursor-help"
          onMouseEnter={tooltip.handleMouseEnter}
          onMouseLeave={tooltip.handleMouseLeave}
          onClick={tooltip.handleClick}
        >
          <div className="space-y-2">
            {note.keyPoints && note.keyPoints.length > 0 ? (
              <ul className="space-y-1 list-none">
                {note.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground flex-1">{stripBullets(point)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No key points recorded yesterday</p>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-black/95 text-white border-black shadow-2xl">
        <p>These notes can only be edited on the day they were created</p>
      </TooltipContent>
    </Tooltip>
  );
};

const HistoricalNotesCard = ({ note }: { note: MeetingNote }) => {
  const tooltip = useDelayedTooltip(5000);

  return (
    <Tooltip open={tooltip.isOpen} onOpenChange={(open) => !open && tooltip.handleClose()}>
      <TooltipTrigger asChild>
        <div 
          className="border-x border-muted/50 rounded-lg p-4 bg-background/50 hover:bg-muted/30 transition-colors cursor-help"
          onMouseEnter={tooltip.handleMouseEnter}
          onMouseLeave={tooltip.handleMouseLeave}
          onClick={tooltip.handleClick}
        >
          <div className="flex items-center mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Historical Notes</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {note.keyPoints && note.keyPoints.length > 0 ? (
              <ul className="space-y-1 list-none">
                {note.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground flex-1">{stripBullets(point)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No key points in last recorded notes</p>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-black/95 text-white border-black shadow-2xl">
        <p>These notes can only be edited on the day they were created</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface NotesSectionProps {
  meetingNote: MeetingNote | null;
  yesterdayMeetingNote?: MeetingNote | null;
  lastRecordedNote?: MeetingNote | null;
  title?: string;
  onUpsertNote?: (keyPoints: string) => Promise<void>;
  onDeleteNote?: (id: string) => void;
  showCard?: boolean;
  isLoading?: boolean;
  selectedDate?: string; // Current selected date in YYYY-MM-DD format
  isYesterdayLoading?: boolean;
  isLastRecordedLoading?: boolean;
}

export const NotesSection = ({ 
  meetingNote, 
  yesterdayMeetingNote,
  lastRecordedNote,
  title = "Meeting Notes", 
  onUpsertNote, 
  onDeleteNote, 
  showCard = true, 
  isLoading = false,
  selectedDate = '',
  isYesterdayLoading = false,
  isLastRecordedLoading = false
}: NotesSectionProps) => {
  // New centralized display logic hook
  const displayLogic = useNotesDisplayLogic({
    yesterdayMeetingNote,
    lastRecordedNote,
    selectedDate,
    isLoading,
    isYesterdayLoading,
    isLastRecordedLoading
  });

  const [newNote, setNewNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [localNoteValue, setLocalNoteValue] = useState(meetingNote?.key_points || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update local value when meetingNote changes
  useEffect(() => {
    setLocalNoteValue(meetingNote?.key_points || "");
  }, [meetingNote?.key_points]);

  const handleSendNote = async () => {
    if (!newNote.trim() || !onUpsertNote) return;
    
    const currentNotes = localNoteValue || "";
    const updatedNotes = currentNotes 
      ? `${currentNotes}\n${newNote.trim()}`
      : newNote.trim();
    
    setLocalNoteValue(updatedNotes);
    await onUpsertNote(updatedNotes);
    setNewNote("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendNote();
    }
  };

  const isEditingNonCurrentDay = () => {
    if (!meetingNote?.note_date || !selectedDate) return false;
    // Use local timezone for current date comparison (fixed timezone bug)
    const currentDay = format(new Date(), 'yyyy-MM-dd');
    return meetingNote.note_date !== currentDay;
  };

  const handleEditMode = () => {
    if (!isEditing && isEditingNonCurrentDay()) {
      setShowEditConfirm(true);
      return;
    }
    setIsEditing(!isEditing);
  };

  const confirmEdit = () => {
    setShowEditConfirm(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setShowEditConfirm(false);
  };

  const handleDeleteNote = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (meetingNote?.id && onDeleteNote) {
      onDeleteNote(meetingNote.id);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Debounced onChange handler for the BulletTextArea (memory leak fixed)
  const debouncedOnChange = useCallback((value: string) => {
    setLocalNoteValue(value);
    
    // Clear existing timeout to prevent overlapping calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Set new timeout with current onUpsertNote reference
    debounceRef.current = setTimeout(() => {
      // Use current onUpsertNote to avoid stale closures
      const currentOnUpsertNote = onUpsertNote;
      if (currentOnUpsertNote) {
        currentOnUpsertNote(value);
      }
      debounceRef.current = null; // Clear reference after execution
    }, 1000); // 1 second debounce
  }, [onUpsertNote]);

  // Manual save handler for BulletTextArea  
  const handleManualSave = useCallback(() => {
    // Cancel any pending debounced saves to avoid duplicate calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    if (onUpsertNote) {
      onUpsertNote(localNoteValue);
    }
  }, [onUpsertNote, localNoteValue]);

  // Cleanup debounce on unmount and dependency changes (memory leak prevention)
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [onUpsertNote]); // Re-run cleanup when onUpsertNote changes

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {localNoteValue && localNoteValue.trim() !== "" && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteNote}
              className="h-8 px-2 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditMode}
              className={`h-8 px-2 ${isEditing ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
          <p>Loading meeting notes...</p>
        </div>
      ) : (
        <>
          {localNoteValue && localNoteValue.trim() !== "" ? (
            <BulletTextArea
              value={localNoteValue}
              onChange={debouncedOnChange}
              placeholder="Type meeting notes and press Enter..."
              className="mb-2"
              disabled={!onUpsertNote || !isEditing}
              initialValue={localNoteValue}
              onSave={handleManualSave}
              rows={undefined}
            />
          ) : (
            <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
              <FileText className="w-24 h-24 mr-4 opacity-50" />
              <p className="max-w-xs">No meeting notes yet. Use the input below to create your first note.</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
              placeholder="Type a note and press Enter or click send..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!onUpsertNote}
            />
            <Button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
              onClick={handleSendNote}
              disabled={!newNote.trim() || !onUpsertNote}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Yesterday's Notes Section - Always Show with New Logic */}
          {displayLogic.shouldShowYesterday && (
            <div className="mt-6 pt-4 border-t-2 border-gray-400">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">
                  {displayLogic.yesterdayDisplay.note 
                    ? `Yesterday's Meeting Notes (${displayLogic.yesterdayDisplay.dateLabel})`
                    : "Yesterday's Meeting Notes"
                  }
                </h4>
              </div>
              
              <div className="space-y-4 opacity-75 max-h-[240px] overflow-y-auto">
                {displayLogic.yesterdayDisplay.hasContent && displayLogic.yesterdayDisplay.note ? (
                  <YesterdayNotesCard note={displayLogic.yesterdayDisplay.note} />
                ) : (
                  <div className="border border-muted/50 rounded-lg p-4 bg-background/50">
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notes found</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Recorded Notes Section - NEW LOGIC: Only show with meaningful validation */}
          {displayLogic.shouldShowLastRecorded && displayLogic.lastRecordedDisplay && (
            <div className="mt-6 pt-4 border-t-2 border-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">
                  Last Recorded Notes ({displayLogic.lastRecordedDisplay.dateLabel})
                </h4>
              </div>
              
              <div className="space-y-4 opacity-75 max-h-[240px] overflow-y-auto">
                <HistoricalNotesCard note={displayLogic.lastRecordedDisplay.note} />
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background border rounded-lg p-6 max-w-md mx-4 shadow-lg">
                <h4 className="text-lg font-semibold mb-2">Delete Meeting Note</h4>
                <p className="text-muted-foreground mb-4">
                  Are you sure you want to delete this entire meeting note? This action cannot be undone and will remove all the content permanently.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showEditConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background border rounded-lg p-6 max-w-md mx-4 shadow-lg">
                <h4 className="text-lg font-semibold mb-2">Edit Note from Different Day</h4>
                <p className="text-muted-foreground mb-4">
                  You are about to edit a note from <strong>{format(new Date(meetingNote?.note_date || ''), 'MMM dd, yyyy')}</strong>.
                  <br /><br />
                  The current day is <strong>{format(new Date(), 'MMM dd, yyyy')}</strong>.
                  <br /><br />
                  Do you want to proceed with editing this note?
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmEdit}
                  >
                    Yes, Edit Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  if (showCard) {
    return (
      <Card className="p-6 shadow-lg">
        {content}
      </Card>
    );
  }

  return <div className="p-6">{content}</div>;
};

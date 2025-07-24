import { BulletTextArea } from "@/components/ui/BulletTextArea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Send, Edit, Trash2, Save } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";

export interface MeetingNote {
  id: string;
  pillar: string;
  note_date: string;
  key_points: string;
  keyPoints?: string[];
  created_at: string;
  updated_at: string;
}

interface NotesSectionProps {
  meetingNote: MeetingNote | null;
  title?: string;
  onUpsertNote?: (keyPoints: string) => Promise<void>;
  onDeleteNote?: (id: string) => void;
  showCard?: boolean;
  isLoading?: boolean;
}

export const NotesSection = ({ 
  meetingNote, 
  title = "Meeting Notes & Discoveries", 
  onUpsertNote, 
  onDeleteNote, 
  showCard = true, 
  isLoading = false 
}: NotesSectionProps) => {
  const [newNote, setNewNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      ? `${currentNotes}\n• ${newNote.trim()}`
      : `• ${newNote.trim()}`;
    
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

  const handleEditMode = () => {
    setIsEditing(!isEditing);
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

  // Debounced onChange handler for the BulletTextArea
  const debouncedOnChange = useCallback((value: string) => {
    setLocalNoteValue(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (onUpsertNote) {
        onUpsertNote(value);
      }
    }, 1000); // 1 second debounce
  }, [onUpsertNote]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditMode}
            disabled={!localNoteValue || localNoteValue.trim() === ""}
            className="h-8 px-2"
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteNote}
            disabled={!localNoteValue || localNoteValue.trim() === ""}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
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
              className="min-h-[2.5rem] mb-4"
              disabled={!onUpsertNote || !isEditing}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm mb-4">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No meeting notes yet. Use the input below to create your first note.</p>
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
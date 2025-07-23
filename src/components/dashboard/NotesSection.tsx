import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, Users, Plus, Info, Check, X, Edit3, Send } from "lucide-react";
import { EditNoteDialog } from "./EditNoteDialog";

export interface MeetingNote {
  id: string;
  date: string;
  keyPoints: string[];
}

export interface SectionLead {
  pillar: string;
  name: string;
}

interface NotesSectionProps {
  meetingNotes: MeetingNote[];
  title?: string;
  onUpdateMeetingNotes?: (meetingNotes: MeetingNote[]) => void;
  onAddNote?: (keyPoints: string) => Promise<void>;
  showCard?: boolean;
}

export const NotesSection = ({ meetingNotes, title = "Meeting Notes & Discoveries", onUpdateMeetingNotes, onAddNote, showCard = true }: NotesSectionProps) => {
  const [editingNote, setEditingNote] = useState<MeetingNote | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  const handleEditNote = (note: MeetingNote) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingNote(undefined);
    setIsDialogOpen(true);
  };

  const handleQuickAddNote = async () => {
    if (!newNoteText.trim()) return;

    if (onAddNote) {
      try {
        await onAddNote(newNoteText.trim());
        setNewNoteText("");
      } catch (error) {
        console.error('Error creating note:', error);
      }
    } else if (onUpdateMeetingNotes) {
      // Fallback to legacy function
      const newNote: MeetingNote = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        keyPoints: [newNoteText.trim()]
      };
      onUpdateMeetingNotes([...meetingNotes, newNote]);
      setNewNoteText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickAddNote();
    }
  };

  const handleSave = async (updatedNote: MeetingNote) => {
    if (editingNote) {
      // Edit existing note - use the legacy function if available
      if (onUpdateMeetingNotes) {
        const updatedNotes = meetingNotes.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        );
        onUpdateMeetingNotes(updatedNotes);
      }
    } else {
      // Add new note - use Supabase function
      if (onAddNote && updatedNote.keyPoints.length > 0) {
        try {
          // Convert key points array to string for Supabase
          const keyPointsString = updatedNote.keyPoints.join('\n');
          await onAddNote(keyPointsString);
        } catch (error) {
          console.error('Error creating note:', error);
        }
      } else if (onUpdateMeetingNotes) {
        // Fallback to legacy function
        onUpdateMeetingNotes([...meetingNotes, updatedNote]);
      }
    }
  };

  // Show tooltip for first-time users
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('hasSeenNotesTooltip');
    if (!hasSeenTooltip && meetingNotes && meetingNotes.length > 0) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem('hasSeenNotesTooltip', 'true');
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [meetingNotes]);

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
      return dateString;
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'daily standup': return 'bg-chart-blue/10 text-chart-blue border-chart-blue/20';
      case 'weekly review': return 'bg-primary/10 text-primary border-primary/20';
      case 'incident review': return 'bg-status-issue/10 text-status-issue border-status-issue/20';
      case 'audit': return 'bg-status-caution/10 text-status-caution border-status-caution/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-6">
        {meetingNotes.slice(0, 1).map((note, index) => (
          <div key={note.id}>
            <div className="space-y-4">
              {/* Key Points */}
              {note.keyPoints.length > 0 && (
                <div className="relative">
                  <div 
                    onClick={() => handleEditNote(note)}
                    className="p-3 rounded-lg border border-transparent cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all duration-200"
                  >
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h4>
                    <ul className="space-y-1 text-sm">
                      {note.keyPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="flex-1 p-2 rounded">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {showTooltip && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="relative">
                        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
                          <Info className="w-3 h-3 inline mr-1" />
                          Click anywhere to edit
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!meetingNotes || meetingNotes.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No meeting notes available</p>
        </div>
      )}

      <div className="border-t pt-4 mt-4 space-y-3">
        <div className="flex space-x-2">
          <Input
            placeholder="Type a note and press Enter or click send..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleQuickAddNote}
            disabled={!newNoteText.trim()}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={handleAddNew} variant="ghost" size="sm" className="w-full text-muted-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Detailed Note
        </Button>
      </div>

      <EditNoteDialog
        meetingNote={editingNote}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
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

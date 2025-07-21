import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, Users, Pencil, Plus } from "lucide-react";
import { EditNoteDialog } from "./EditNoteDialog";

export interface MeetingNote {
  id: string;
  date: string;
  meetingType: string;
  attendees: string[];
  notes: string;
  keyPoints: string[];
  nextMeeting?: string;
}

interface NotesSectionProps {
  meetingNotes: MeetingNote[];
  title?: string;
  onUpdateMeetingNotes?: (meetingNotes: MeetingNote[]) => void;
  showCard?: boolean;
}

export const NotesSection = ({ meetingNotes, title = "Meeting Notes & Discoveries", onUpdateMeetingNotes, showCard = true }: NotesSectionProps) => {
  const [editingNote, setEditingNote] = useState<MeetingNote | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditNote = (note: MeetingNote) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingNote(undefined);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedNote: MeetingNote) => {
    if (!onUpdateMeetingNotes) return;
    
    if (editingNote) {
      // Edit existing note
      const updatedNotes = meetingNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      onUpdateMeetingNotes(updatedNotes);
    } else {
      // Add new note
      onUpdateMeetingNotes([...meetingNotes, updatedNote]);
    }
  };
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
        {meetingNotes.map((note, index) => (
          <div key={note.id}>
            <div className="space-y-4">
              {/* Meeting Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getMeetingTypeColor(note.meetingType)}`}
                    >
                      {note.meetingType}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{note.date}</span>
                      <span className="text-xs">({formatRelativeDate(note.date)})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Attendees: {note.attendees.join(', ')}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditNote(note)}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>

              {/* Meeting Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Meeting Notes</h4>
                  <p className="text-sm leading-relaxed">{note.notes}</p>
                </div>

                {note.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h4>
                    <ul className="space-y-1 text-sm">
                      {note.keyPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.nextMeeting && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Next Meeting:</span>{' '}
                      <span>{note.nextMeeting}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {index < meetingNotes.length - 1 && (
              <Separator className="mt-6" />
            )}
          </div>
        ))}
      </div>

      {meetingNotes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No meeting notes available</p>
        </div>
      )}

      <div className="border-t pt-4 mt-4">
        <Button onClick={handleAddNew} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Meeting Note
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
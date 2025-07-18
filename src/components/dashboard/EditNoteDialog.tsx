import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { MeetingNote } from "./NotesSection";

interface EditNoteDialogProps {
  meetingNote?: MeetingNote;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meetingNote: MeetingNote) => void;
}

export const EditNoteDialog = ({ meetingNote, isOpen, onClose, onSave }: EditNoteDialogProps) => {
  const [formData, setFormData] = useState<MeetingNote>({
    id: meetingNote?.id || '',
    date: meetingNote?.date || new Date().toISOString().split('T')[0],
    meetingType: meetingNote?.meetingType || '',
    attendees: meetingNote?.attendees || [],
    notes: meetingNote?.notes || '',
    keyPoints: meetingNote?.keyPoints || [],
    nextMeeting: meetingNote?.nextMeeting || ''
  });

  useEffect(() => {
    setFormData({
      id: meetingNote?.id || '',
      date: meetingNote?.date || new Date().toISOString().split('T')[0],
      meetingType: meetingNote?.meetingType || '',
      attendees: meetingNote?.attendees || [],
      notes: meetingNote?.notes || '',
      keyPoints: meetingNote?.keyPoints || [],
      nextMeeting: meetingNote?.nextMeeting || ''
    });
    setNewAttendee('');
    setNewKeyPoint('');
  }, [meetingNote]);

  const [newAttendee, setNewAttendee] = useState('');
  const [newKeyPoint, setNewKeyPoint] = useState('');

  const addAttendee = () => {
    if (newAttendee.trim()) {
      setFormData({...formData, attendees: [...formData.attendees, newAttendee.trim()]});
      setNewAttendee('');
    }
  };

  const removeAttendee = (index: number) => {
    setFormData({...formData, attendees: formData.attendees.filter((_, i) => i !== index)});
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData({...formData, keyPoints: [...formData.keyPoints, newKeyPoint.trim()]});
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setFormData({...formData, keyPoints: formData.keyPoints.filter((_, i) => i !== index)});
  };

  const handleSave = () => {
    if (!formData.id) {
      formData.id = Date.now().toString();
    }
    onSave(formData);
    onClose();
  };

  const isEditing = !!meetingNote;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Meeting Note' : 'Add New Meeting Note'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meetingType">Meeting Type</Label>
              <Input
                id="meetingType"
                value={formData.meetingType}
                onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                placeholder="e.g. Daily Standup, Weekly Review"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Attendees</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                placeholder="Add attendee"
                onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
              />
              <Button type="button" onClick={addAttendee} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.attendees.map((attendee, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {attendee}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeAttendee(index)} />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Meeting Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Enter meeting notes"
              rows={4}
            />
          </div>

          <div>
            <Label>Key Points</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newKeyPoint}
                onChange={(e) => setNewKeyPoint(e.target.value)}
                placeholder="Add key point"
                onKeyDown={(e) => e.key === 'Enter' && addKeyPoint()}
              />
              <Button type="button" onClick={addKeyPoint} size="sm">Add</Button>
            </div>
            <div className="space-y-1">
              {formData.keyPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <span className="flex-1 text-sm">{point}</span>
                  <X className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => removeKeyPoint(index)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="nextMeeting">Next Meeting</Label>
            <Input
              id="nextMeeting"
              value={formData.nextMeeting}
              onChange={(e) => setFormData({...formData, nextMeeting: e.target.value})}
              placeholder="Next meeting details (optional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? 'Save Changes' : 'Add Meeting Note'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Edit2, Check } from "lucide-react";
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
    date: meetingNote?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    keyPoints: meetingNote?.keyPoints || []
  });

  useEffect(() => {
    setFormData({
      id: meetingNote?.id || '',
      date: meetingNote?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      keyPoints: meetingNote?.keyPoints || []
    });
    setNewKeyPoint('');
  }, [meetingNote]);

  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [editingKeyPointIndex, setEditingKeyPointIndex] = useState<number | null>(null);
  const [editingKeyPointText, setEditingKeyPointText] = useState('');

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData({...formData, keyPoints: [...formData.keyPoints, newKeyPoint.trim()]});
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setFormData({...formData, keyPoints: formData.keyPoints.filter((_, i) => i !== index)});
  };

  const startEditingKeyPoint = (index: number, currentText: string) => {
    setEditingKeyPointIndex(index);
    setEditingKeyPointText(currentText);
  };

  const saveKeyPointEdit = () => {
    if (editingKeyPointIndex !== null && editingKeyPointText.trim()) {
      const updatedKeyPoints = [...formData.keyPoints];
      updatedKeyPoints[editingKeyPointIndex] = editingKeyPointText.trim();
      setFormData({...formData, keyPoints: updatedKeyPoints});
      setEditingKeyPointIndex(null);
      setEditingKeyPointText('');
    }
  };

  const cancelKeyPointEdit = () => {
    setEditingKeyPointIndex(null);
    setEditingKeyPointText('');
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
          <DialogDescription>
            {isEditing ? 'Modify the meeting note details and key points below.' : 'Create a new meeting note by adding key points and discussion items.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              placeholder="e.g. Jan 21, 2025"
            />
          </div>

          <div>
            <Label htmlFor="keyPoints">Key Points</Label>
            <div className="flex gap-2 mb-2">
              <Textarea
                id="keyPoints"
                value={newKeyPoint}
                onChange={(e) => setNewKeyPoint(e.target.value)}
                placeholder="Add new key point... (Ctrl+Enter to add)"
                className="flex-1 text-sm min-h-[2.5rem] resize-both border-muted-foreground/20 focus:border-primary"
                style={{ 
                  resize: 'both', 
                  minWidth: '200px', 
                  maxWidth: '100%',
                  minHeight: '40px',
                  maxHeight: '200px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    addKeyPoint();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={addKeyPoint} 
                size="sm"
                title="Add Key Point (Ctrl+Enter)"
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                  {editingKeyPointIndex === index ? (
                    <>
                      <Textarea
                        value={editingKeyPointText}
                        onChange={(e) => setEditingKeyPointText(e.target.value)}
                        className="flex-1 text-sm min-h-[2.5rem] resize-both border-primary/50 focus:border-primary"
                        style={{ 
                          resize: 'both', 
                          minWidth: '200px', 
                          maxWidth: '100%',
                          minHeight: '40px',
                          maxHeight: '300px'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            saveKeyPointEdit();
                          } else if (e.key === 'Escape') {
                            cancelKeyPointEdit();
                          }
                        }}
                        placeholder="Edit key point... (Ctrl+Enter to save, Esc to cancel)"
                        autoFocus
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={saveKeyPointEdit}
                          title="Save (Ctrl+Enter)"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={cancelKeyPointEdit}
                          title="Cancel (Esc)"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{point}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => startEditingKeyPoint(index, point)}
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
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
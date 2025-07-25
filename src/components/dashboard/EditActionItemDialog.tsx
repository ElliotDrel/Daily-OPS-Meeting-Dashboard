import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ActionItem } from "./ActionItemsSection";

interface EditActionItemDialogProps {
  actionItem?: ActionItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (actionItem: ActionItem) => void;
}

export const EditActionItemDialog = ({ actionItem, isOpen, onClose, onSave }: EditActionItemDialogProps) => {
  const [formData, setFormData] = useState<ActionItem>({
    id: actionItem?.id || '',
    pillar: actionItem?.pillar || '',
    item_date: actionItem?.item_date || new Date().toISOString().split('T')[0],
    description: actionItem?.description || '',
    assignee: actionItem?.assignee || 'TBD',
    priority: actionItem?.priority || 'Medium',
    status: actionItem?.status || 'Open',
    due_date: actionItem?.due_date || actionItem?.dueDate || '',
    created_at: actionItem?.created_at || new Date().toISOString(),
    updated_at: actionItem?.updated_at || new Date().toISOString(),
    category: actionItem?.category || ''
  });

  useEffect(() => {
    setFormData({
      id: actionItem?.id || '',
      pillar: actionItem?.pillar || '',
      item_date: actionItem?.item_date || new Date().toISOString().split('T')[0],
      description: actionItem?.description || '',
      assignee: actionItem?.assignee || 'TBD',
      priority: actionItem?.priority || 'Medium',
      status: actionItem?.status || 'Open',
      due_date: actionItem?.due_date || actionItem?.dueDate || '',
      created_at: actionItem?.created_at || new Date().toISOString(),
      updated_at: actionItem?.updated_at || new Date().toISOString(),
      category: actionItem?.category || ''
    });
  }, [actionItem]);

  const handleSave = () => {
    const now = new Date().toISOString();
    if (!formData.id) {
      // Creating new item
      const newItem = {
        ...formData,
        id: Date.now().toString(),
        created_at: now,
        updated_at: now,
        item_date: now.split('T')[0]
      };
      onSave(newItem);
    } else {
      // Updating existing item
      onSave({
        ...formData,
        updated_at: now
      });
    }
    onClose();
  };

  const isEditing = !!actionItem;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Action Item' : 'Add New Action Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the action item details and assignment information.' : 'Create a new action item with description, assignee, and due date.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value, updated_at: new Date().toISOString()})}
              placeholder="Enter action item description"
            />
          </div>

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={formData.assignee || ''}
              onChange={(e) => setFormData({...formData, assignee: e.target.value, updated_at: new Date().toISOString()})}
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category || ''}
              onChange={(e) => setFormData({...formData, category: e.target.value, updated_at: new Date().toISOString()})}
              placeholder="Enter category (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as ActionItem['priority'], updated_at: new Date().toISOString()})}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as ActionItem['status'], updated_at: new Date().toISOString()})}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({...formData, due_date: e.target.value, updated_at: new Date().toISOString()})}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? 'Save Changes' : 'Add Action Item'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
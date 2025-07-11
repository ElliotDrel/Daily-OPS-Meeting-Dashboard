import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    description: actionItem?.description || '',
    assignee: actionItem?.assignee || '',
    priority: actionItem?.priority || 'Medium',
    dueDate: actionItem?.dueDate || '',
    status: actionItem?.status || 'Open',
    category: actionItem?.category || ''
  });

  useEffect(() => {
    setFormData({
      id: actionItem?.id || '',
      description: actionItem?.description || '',
      assignee: actionItem?.assignee || '',
      priority: actionItem?.priority || 'Medium',
      dueDate: actionItem?.dueDate || '',
      status: actionItem?.status || 'Open',
      category: actionItem?.category || ''
    });
  }, [actionItem]);

  const handleSave = () => {
    if (!formData.id) {
      formData.id = Date.now().toString();
    }
    onSave(formData);
    onClose();
  };

  const isEditing = !!actionItem;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Action Item' : 'Add New Action Item'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter action item description"
            />
          </div>

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="Enter category (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as ActionItem['priority']})}>
                <SelectTrigger>
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
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as ActionItem['status']})}>
                <SelectTrigger>
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
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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
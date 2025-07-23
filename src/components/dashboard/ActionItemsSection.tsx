import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, User, AlertTriangle, Pencil, Plus, Send } from "lucide-react";
import { EditActionItemDialog } from "./EditActionItemDialog";

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed';
  category?: string;
}

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  title?: string;
  onUpdateActionItems?: (actionItems: ActionItem[]) => void;
  showCard?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'border-status-issue text-status-issue bg-status-issue/5';
    case 'Medium': return 'border-status-caution text-status-caution bg-status-caution/5';
    case 'Low': return 'border-status-good text-status-good bg-status-good/5';
    default: return 'border-border text-muted-foreground';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-status-good border-status-good text-white';
    case 'In Progress': return 'border-status-caution text-status-caution bg-status-caution/5';
    case 'Open': return 'border-status-issue text-status-issue bg-status-issue/5';
    default: return 'border-border text-muted-foreground';
  }
};

const isOverdue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};

export const ActionItemsSection = ({ actionItems, title = "Action Items", onUpdateActionItems, showCard = true }: ActionItemsSectionProps) => {
  const [editingItem, setEditingItem] = useState<ActionItem | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const handleEditItem = (item: ActionItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(undefined);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedItem: ActionItem) => {
    if (!onUpdateActionItems) return;
    
    if (editingItem) {
      // Edit existing item
      const updatedItems = actionItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      onUpdateActionItems(updatedItems);
    } else {
      // Add new item
      onUpdateActionItems([...actionItems, updatedItem]);
    }
  };

  const validateInput = (text: string): void => {
    if (text.length > 500) {
      throw new Error('Description must be 500 characters or less');
    }
    if (text.trim().length < 3) {
      throw new Error('Description must be at least 3 characters');
    }
    if (!/^[\w\s\-.,!?()]+$/.test(text.trim())) {
      throw new Error('Description contains invalid characters');
    }
  };

  const handleQuickAddItem = () => {
    if (!newItemText.trim() || !onUpdateActionItems) return;

    try {
      validateInput(newItemText);
      
      // Create a basic action item with default values
      const newItem: ActionItem = {
        id: Date.now().toString(),
        description: newItemText.trim(),
        assignee: "TBD", // Default assignee
        priority: "Medium", // Default priority
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
        status: "Open", // Default status
        category: undefined
      };

      onUpdateActionItems([...actionItems, newItem]);
      setNewItemText("");
    } catch (error) {
      console.error('Validation error:', error);
      alert(error instanceof Error ? error.message : 'Invalid input');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickAddItem();
    }
  };
  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Description</TableHead>
              <TableHead className="w-[15%]">Assignee</TableHead>
              <TableHead className="w-[12%]">Priority</TableHead>
              <TableHead className="w-[15%]">Due Date</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[11%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actionItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.assignee}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-4 h-4 ${isOverdue(item.dueDate) ? 'text-status-issue' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${isOverdue(item.dueDate) ? 'text-status-issue font-medium' : ''}`}>
                      {item.dueDate}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant={item.status === 'Completed' ? 'default' : 'outline'}
                    className={`text-xs ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {actionItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No action items at this time</p>
        </div>
      )}

      <div className="border-t pt-4 mt-4 space-y-3">
        <div className="flex space-x-2">
          <Input
            placeholder="Type an action item and press Enter or click send..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleQuickAddItem}
            disabled={!newItemText.trim()}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={handleAddNew} variant="ghost" size="sm" className="w-full text-muted-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Detailed Action Item
        </Button>
      </div>

      <EditActionItemDialog
        actionItem={editingItem}
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

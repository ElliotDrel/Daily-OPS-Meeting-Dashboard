import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, User, AlertTriangle, Pencil, Plus } from "lucide-react";
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

export const ActionItemsSection = ({ actionItems, title = "Action Items", onUpdateActionItems }: ActionItemsSectionProps) => {
  const [editingItem, setEditingItem] = useState<ActionItem | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  return (
    <Card className="p-6 shadow-lg">
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

      <div className="border-t pt-4 mt-4">
        <Button onClick={handleAddNew} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Action Item
        </Button>
      </div>

      <EditActionItemDialog
        actionItem={editingItem}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </Card>
  );
};
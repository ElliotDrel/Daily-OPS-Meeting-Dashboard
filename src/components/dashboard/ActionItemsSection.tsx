import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Plus, Calendar } from "lucide-react";
import { EditActionItemDialog } from "./EditActionItemDialog";
import { PersonCard, PriorityCard, DateCard, StatusCard } from "./ActionItemCards";
import { useDelayedTooltip } from "@/hooks/useDelayedTooltip";

export interface ActionItem {
  id: string;
  pillar: string;
  item_date: string;
  description: string;
  assignee: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  category?: string;
}

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  yesterdayActionItems?: ActionItem[];
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

const YesterdayActionItem = ({ item }: { item: ActionItem }) => {
  const tooltip = useDelayedTooltip(5000);

  return (
    <Tooltip open={tooltip.isOpen} onOpenChange={(open) => !open && tooltip.handleClose()}>
      <TooltipTrigger asChild>
        <div 
          className="opacity-75 cursor-help"
          onMouseEnter={tooltip.handleMouseEnter}
          onMouseLeave={tooltip.handleMouseLeave}
          onClick={tooltip.handleClick}
        >
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-muted-foreground mt-1">•</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{item.description}</p>
                {item.category && (
                  <Badge variant="outline" className="text-xs mt-1 opacity-75">
                    {item.category}
                  </Badge>
                )}
              </div>
            </div>
            <div className="ml-4 flex flex-wrap gap-2">
              <PersonCard assignee={item.assignee || 'TBD'} />
              <PriorityCard priority={item.priority || 'Medium'} />
              <DateCard dueDate={item.due_date || ''} />
              <StatusCard status={item.status || 'Open'} />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>These items can only be edited on the day they were created</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const ActionItemsSection = ({ actionItems, yesterdayActionItems = [], title = "Action Items", onUpdateActionItems, showCard = true }: ActionItemsSectionProps) => {
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

  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-4">
        {/* Current Action Items */}
        {actionItems.length > 0 ? (
          actionItems.map((item) => (
            <div 
              key={item.id} 
              className="cursor-pointer hover:bg-muted/30 p-3 rounded-lg transition-colors"
              onClick={() => handleEditItem(item)}
            >
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    {item.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-wrap gap-2">
                  <PersonCard assignee={item.assignee || 'TBD'} />
                  <PriorityCard priority={item.priority || 'Medium'} />
                  <DateCard dueDate={item.due_date || ''} />
                  <StatusCard status={item.status || 'Open'} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-0.5 text-muted-foreground text-sm mb-4">
            <AlertTriangle className="w-16 h-16 mr-4 opacity-50" />
            <p className="max-w-xs">No current action items</p>
          </div>
        )}
        
        {/* Yesterday's Items Section */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Yesterday's Action Items</span>
            <Badge variant="outline" className="text-xs bg-muted/50">
              {yesterdayActionItems.length} item{yesterdayActionItems.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {yesterdayActionItems.length > 0 ? (
            <div className="space-y-3">
              {yesterdayActionItems.map((item) => (
                <YesterdayActionItem key={`yesterday-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No action items from yesterday</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <Button onClick={handleAddNew} variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Action Item
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

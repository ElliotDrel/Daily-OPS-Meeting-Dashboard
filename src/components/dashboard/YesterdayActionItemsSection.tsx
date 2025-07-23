import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, User, AlertTriangle, Calendar } from "lucide-react";
import type { ActionItem } from "@/hooks/usePillarData";
import { format } from "date-fns";

interface YesterdayActionItemsSectionProps {
  actionItems: ActionItem[];
  title?: string;
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

export const YesterdayActionItemsSection = ({ 
  actionItems, 
  title = "Yesterday's Action Items", 
  showCard = true 
}: YesterdayActionItemsSectionProps) => {
  if (!actionItems || actionItems.length === 0) {
    return null; // Don't show the section if there are no yesterday items
  }

  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
        <Badge variant="outline" className="text-xs bg-muted/50">
          {actionItems.length} item{actionItems.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="overflow-x-auto opacity-75">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Description</TableHead>
              <TableHead className="w-[15%]">Assignee</TableHead>
              <TableHead className="w-[12%]">Priority</TableHead>
              <TableHead className="w-[15%]">Due Date</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[11%]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actionItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{item.description}</p>
                    {item.category && (
                      <Badge variant="outline" className="text-xs opacity-75">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{item.assignee}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline"
                    className={`text-xs opacity-75 ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-4 h-4 ${isOverdue(item.due_date || '') ? 'text-status-issue' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${isOverdue(item.due_date || '') ? 'text-status-issue font-medium' : 'text-muted-foreground'}`}>
                      {item.due_date || 'No due date'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant={item.status === 'Completed' ? 'default' : 'outline'}
                    className={`text-xs opacity-75 ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.item_date), 'MMM dd')}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );

  if (showCard) {
    return (
      <Card className="p-6 shadow-lg border-muted/50 bg-muted/20">
        {content}
      </Card>
    );
  }

  return <div className="p-6 bg-muted/20 rounded-lg border border-muted/50">{content}</div>;
};
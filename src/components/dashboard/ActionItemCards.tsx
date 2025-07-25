import { User, Flag, Calendar, Circle } from "lucide-react";

interface PersonCardProps {
  assignee: string;
}

interface PriorityCardProps {
  priority: string;
}

interface DateCardProps {
  dueDate: string;
}

interface StatusCardProps {
  status: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-status-issue text-white';
    case 'Medium': return 'bg-status-caution text-white';
    case 'Low': return 'bg-status-good text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
};

export const PersonCard = ({ assignee }: PersonCardProps) => (
  <div className="inline-flex items-center space-x-1 px-2 py-1 border rounded text-sm">
    <User className="w-4 h-4" />
    <span>{assignee || 'Unassigned'}</span>
  </div>
);

export const PriorityCard = ({ priority }: PriorityCardProps) => (
  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-sm ${getPriorityColor(priority)}`}>
    <Flag className="w-4 h-4" />
    <span>{priority}</span>
  </div>
);

export const DateCard = ({ dueDate }: DateCardProps) => (
  <div className="inline-flex items-center space-x-1 px-2 py-1 border rounded text-sm">
    <Calendar className="w-4 h-4" />
    <span>{dueDate ? formatDate(dueDate) : 'No due date'}</span>
  </div>
);

export const StatusCard = ({ status }: StatusCardProps) => (
  <div className="inline-flex items-center space-x-1 px-2 py-1 border rounded text-sm">
    <Circle className="w-4 h-4" />
    <span>{status}</span>
  </div>
);

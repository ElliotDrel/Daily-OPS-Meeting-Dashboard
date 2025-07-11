import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface MiniCalendarProps {
  targetDate: Date;
  squaresData?: Array<{
    status: string;
    date: string;
    value: number;
    label?: string;
  }>;
  className?: string;
}

// Status color mapping for mini calendar
const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'bg-status-good text-white';
    case 'caution':
      return 'bg-status-caution text-white';
    case 'issue':
      return 'bg-status-issue text-white';
    case 'future':
      return 'bg-gray-100 text-gray-400';
    default:
      return 'bg-status-good text-white';
  }
};

export const MiniCalendar = ({ targetDate, squaresData, className }: MiniCalendarProps) => {
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <Card className={cn("p-3 shadow-lg", className)}>
      {/* Month/Year Header */}
      <div className="text-center mb-2">
        <h4 className="text-sm font-semibold">{format(targetDate, 'MMMM yyyy')}</h4>
      </div>

      {/* Days of week header (abbreviated for mini view) */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-5"></div>
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const dayNumber = parseInt(format(day, 'd'));
          const squareData = squaresData?.[dayNumber - 1];
          const status = squareData?.status || 'good';

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "h-5 w-5 rounded-sm flex items-center justify-center text-xs transition-colors",
                getStatusColor(status)
              )}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </Card>
  );
}; 
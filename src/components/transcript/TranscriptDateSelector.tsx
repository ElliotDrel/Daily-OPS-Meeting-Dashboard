// Transcript date selector component - navigation bar with date controls
// Matches the exact element provided in requirements

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format, subDays, isToday } from 'date-fns';
import { TranscriptDateSelectorProps } from '@/types/transcript';

export const TranscriptDateSelector: React.FC<TranscriptDateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handlePreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center bg-muted/50 px-4 py-2 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousDay}
        className="px-2 py-1 h-8 flex items-center gap-1"
        title="Go to previous day"
        aria-label="Go to previous day"
      >
        <ArrowLeft className="w-4 h-4" />
        Previous Day
      </Button>
      
      <div className="flex flex-col items-center min-w-64">
        <span className="text-sm font-medium text-muted-foreground">Selected Date:</span>
        <span className="text-lg font-semibold text-foreground">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={!isToday(selectedDate) ? handleToday : undefined}
        disabled={isToday(selectedDate)}
        className="px-2 py-1 h-8"
        title={isToday(selectedDate) ? "Currently viewing today" : "Go to today"}
        aria-label={isToday(selectedDate) ? "Currently viewing today" : "Go to today"}
      >
        {isToday(selectedDate) ? "Current" : "Today"}
      </Button>
    </div>
  );
};
// Transcript calendar component - using existing Calendar component from pillar pages
// Matches the exact calendar structure used in PillarLayout

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { TranscriptCalendarProps } from '@/types/transcript';

export const TranscriptCalendar: React.FC<TranscriptCalendarProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const [month, setMonth] = useState<Date>(selectedDate);
  
  // Calculate previous month for the second calendar
  const getPreviousMonth = (date: Date) => {
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth;
  };

  // Helper for multiple months back
  const getMonthsBack = (date: Date, monthsBack: number) => {
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - monthsBack);
    return prevMonth;
  };

  return (
    <div className="lg:col-span-3 h-screen overflow-y-auto">
      <div className="space-y-3">
        {/* Calendar */}
        <Calendar
          size="mini"
          scale={1.2}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          month={month}
          onMonthChange={setMonth}
          showHeader={true}
          className="w-full min-h-[280px]"
        />

        {/* Previous Month Calendar */}
        <Calendar
          size="mini"
          scale={1.2}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          month={getPreviousMonth(month)}
          onMonthChange={() => {}} // No-op to prevent navigation
          showHeader={true}
          showNavigation={false}
          className="w-full min-h-[280px]"
        />

        {/* Multi-Calendar Card */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {/* 2 Months Ago - Top Left */}
            <Calendar
              size="mini"
              scale={0.7}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              month={getMonthsBack(month, 2)}
              onMonthChange={() => {}}
              showHeader={true}
              showNavigation={false}
              className="w-full"
            />

            {/* 3 Months Ago - Top Right */}
            <Calendar
              size="mini"
              scale={0.7}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              month={getMonthsBack(month, 3)}
              onMonthChange={() => {}}
              showHeader={true}
              showNavigation={false}
              className="w-full"
            />

            {/* 4 Months Ago - Bottom Left */}
            <Calendar
              size="mini"
              scale={0.7}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              month={getMonthsBack(month, 4)}
              onMonthChange={() => {}}
              showHeader={true}
              showNavigation={false}
              className="w-full"
            />

            {/* 5 Months Ago - Bottom Right */}
            <Calendar
              size="mini"
              scale={0.7}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              month={getMonthsBack(month, 5)}
              onMonthChange={() => {}}
              showHeader={true}
              showNavigation={false}
              className="w-full"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format, subDays, isToday } from "date-fns";
import { useDate } from "@/contexts/DateContext";

interface PillarLayoutProps {
  letter: string;
  pillarName: string;
  pillarColor: string;
  children: React.ReactNode;
  squares: Array<{
    status: string;
    date: string;
    value: number;
    label?: string;
  }>;
  actionItems?: Array<{
    id: string;
    text: string;
    status: string;
    count?: number;
  }>;
  graphsPane?: React.ReactNode;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'bg-status-good shadow-sm shadow-status-good/40';
    case 'caution':
      return 'bg-status-caution shadow-sm shadow-status-caution/40';
    case 'issue':
      return 'bg-status-issue shadow-sm shadow-status-issue/40';
    case 'future':
      return 'bg-status-future';
    default:
      return 'bg-status-future';
  }
};

const getRandomPastDayColor = () => {
  const colors = ['bg-status-issue', 'bg-status-caution', 'bg-status-good'];
  return colors[Math.floor(Math.random() * colors.length)];
};




export const PillarLayout = ({
  letter,
  pillarName,
  pillarColor,
  children,
  squares,
  actionItems = [],
  graphsPane
}: PillarLayoutProps) => {
  const { selectedDate, setSelectedDate } = useDate();
  const [month, setMonth] = useState(new Date());
  
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

  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{pillarName} KPI Dashboard</h1>
            </div>
            <div className="flex items-center bg-muted/50 px-4 py-2 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
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
                onClick={!isToday(selectedDate) ? () => setSelectedDate(new Date()) : undefined}
                disabled={isToday(selectedDate)}
                className="px-2 py-1 h-8"
                title={isToday(selectedDate) ? "Currently viewing today" : "Go to today"}
                aria-label={isToday(selectedDate) ? "Currently viewing today" : "Go to today"}
              >
                {isToday(selectedDate) ? "Current" : "Today"}
              </Button>
            </div>
          </div>

          {/* Three column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Column - Calendar (25%) */}
            <div className="lg:col-span-3 h-screen overflow-y-auto">
              <div className="space-y-3">
                {/* Calendar */}
                <Calendar
                  size="mini"
                  scale={1.2}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
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
                  onDateSelect={setSelectedDate}
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
                      onDateSelect={setSelectedDate}
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
                      onDateSelect={setSelectedDate}
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
                      onDateSelect={setSelectedDate}
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
                      onDateSelect={setSelectedDate}
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

            {/* Middle Column - Graphs (37.5%) */}
            <div className="lg:col-span-4 h-screen">
              {graphsPane}
            </div>

            {/* Right Column - Notes and Action Items (37.5%) */}
            <div className="lg:col-span-5 h-screen overflow-y-auto">
              {children}
            </div>
          </div>
        </motion.div>
      </div>

    </div>;
};

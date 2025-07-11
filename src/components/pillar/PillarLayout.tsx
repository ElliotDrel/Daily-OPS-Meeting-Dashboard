import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, generateMiniCalendarData } from "@/lib/utils";
import { useState } from "react";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, subMonths } from "date-fns";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";

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

// Generate squares for previous month
const generatePreviousMonthSquares = () => {
  const squares: Array<{status: string; date: string; value: number; label?: string}> = [];
  const previousMonth = subMonths(new Date(), 1);
  const daysInMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const rand = Math.random();
    let status: string;
    
    if (rand < 0.7) status = 'good';
    else if (rand < 0.9) status = 'caution';
    else status = 'issue';
    
    squares.push({
      status,
      date: `${previousMonth.getMonth() + 1}/${i}`,
      value: Math.floor(Math.random() * 100),
      label: '%'
    });
  }
  
  return squares;
};

// Generate squares for 4-month rolling view (compact view)
const generateFourMonthRollingSquares = () => {
  const monthsData: Array<{month: string; squares: Array<{status: string; date: string; value: number; label?: string}>}> = [];
  
  for (let monthOffset = 5; monthOffset >= 2; monthOffset--) {
    const targetMonth = subMonths(new Date(), monthOffset);
    const monthName = format(targetMonth, 'MMM');
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
    
    const squares: Array<{status: string; date: string; value: number; label?: string}> = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const rand = Math.random();
      let status: string;
      
      if (rand < 0.65) status = 'good';
      else if (rand < 0.85) status = 'caution';
      else status = 'issue';
      
      squares.push({
        status,
        date: `${targetMonth.getMonth() + 1}/${i}`,
        value: Math.floor(Math.random() * 100),
        label: '%'
      });
    }
    
    monthsData.push({ month: monthName, squares });
  }
  
  return monthsData;
};



export const PillarLayout = ({
  letter,
  pillarName,
  pillarColor,
  children,
  squares,
  actionItems = []
}: PillarLayoutProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  
  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };
  
  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  // Generate calendar days for current month
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get first day of week for the month to calculate offset
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  // Generate data for additional calendars
  const previousMonthSquares = generatePreviousMonthSquares();
  const miniCalendarData = generateMiniCalendarData();
  const previousMonth = subMonths(today, 1);

  // Helper function to render a calendar grid
  const renderCalendarGrid = (targetDate: Date, squaresData?: Array<{status: string; date: string; value: number; label?: string}>) => {
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return (
      <>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground text-center p-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-8"></div>
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
                  "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
                  getStatusColor(status)
                )}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </>
    );
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
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{pillarName} KPI Dashboard</h1>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - 25% */}
            <div className="lg:col-span-1 space-y-6">
              {/* Day Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={handlePrevDay}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(currentDate, 'EEEE, MMMM d')}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextDay}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Month Calendar */}
              <Card className="p-6 shadow-xl">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{format(today, 'MMMM yyyy')}</h3>
                </div>
                
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-xs font-medium text-muted-foreground text-center p-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="h-8"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {daysInMonth.map((day) => {
                    const isPastDay = isBefore(day, today) && !isSameDay(day, today);
                    const isToday = isSameDay(day, today);
                    const isSelectedDay = isSameDay(day, currentDate);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
                          isPastDay && getRandomPastDayColor(),
                          isToday && "bg-primary text-primary-foreground font-semibold",
                          isSelectedDay && !isToday && "bg-blue-500 text-white font-medium",
                          !isPastDay && !isToday && !isSelectedDay && "hover:bg-muted/50"
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Previous Month Calendar */}
              <Card className="p-6 shadow-xl">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{format(previousMonth, 'MMMM yyyy')}</h3>
                </div>
                {renderCalendarGrid(previousMonth, previousMonthSquares)}
              </Card>

              {/* Four Month Rolling View - Mini Calendars */}
              <Card className="p-4 shadow-xl">
                <div className="grid grid-cols-2 gap-3">
                  {miniCalendarData.map((calendarData, index) => (
                    <MiniCalendar
                      key={index}
                      targetDate={calendarData.targetDate}
                      squaresData={calendarData.squaresData}
                    />
                  ))}
                </div>
              </Card>

              {/* Action Items */}
              
            </div>

            {/* Right Column - 75% */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
};
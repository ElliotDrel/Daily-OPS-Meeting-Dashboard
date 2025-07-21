import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";

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




export const PillarLayout = ({
  letter,
  pillarName,
  pillarColor,
  children,
  squares,
  actionItems = []
}: PillarLayoutProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Left Column - 25% */}
            <div className="lg:col-span-1 space-y-3">
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
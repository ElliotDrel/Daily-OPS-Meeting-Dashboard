import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { subMonths } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Types for calendar data
export interface CalendarSquareData {
  status: string;
  date: string;
  value: number;
  label?: string;
}

export interface MiniCalendarData {
  targetDate: Date;
  squaresData: CalendarSquareData[];
}

/**
 * Generates mini-calendar data for multiple months
 * @param monthOffsets Array of month offsets from current date (e.g., [2, 3, 4, 5] for 2-5 months ago)
 * @returns Array of mini-calendar data objects
 */
export function generateMiniCalendarData(monthOffsets: number[] = [2, 3, 4, 5]): MiniCalendarData[] {
  const miniCalendarData: MiniCalendarData[] = [];
  
  for (const monthOffset of monthOffsets) {
    const targetMonth = subMonths(new Date(), monthOffset);
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
    
    const squaresData: CalendarSquareData[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const rand = Math.random();
      let status: string;
      
      if (rand < 0.65) status = 'good';
      else if (rand < 0.85) status = 'caution';
      else status = 'issue';
      
      squaresData.push({
        status,
        date: `${targetMonth.getMonth() + 1}/${i}`,
        value: Math.floor(Math.random() * 100),
        label: '%'
      });
    }
    
    miniCalendarData.push({ targetDate: targetMonth, squaresData });
  }
  
  return miniCalendarData;
}

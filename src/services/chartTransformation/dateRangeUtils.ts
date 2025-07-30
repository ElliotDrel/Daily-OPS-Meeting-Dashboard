// Date Range Calculation Utilities
// Provides calendar-aware date range calculations for different time period views

export interface DateInfo {
  date: Date;
  dateString: string; // YYYY-MM-DD format
  label: string; // Display label (e.g., "07/30", "Week 1", "Jul")
  isFuture: boolean;
  isToday: boolean;
}

export interface WeekInfo {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
  dates: Date[];
}

export interface MonthInfo {
  month: number; // 0-11 (JavaScript month format)
  year: number;
  startDate: Date;
  endDate: Date;
  label: string; // e.g., "May", "Jun", "Jul"
}

/**
 * Calculate dates for week view (5 consecutive days centered around today)
 * If today is Tuesday: Monday, Tuesday, Wednesday, Thursday, Friday
 */
export function calculateWeekViewDates(referenceDate: Date = new Date()): DateInfo[] {
  const dates: DateInfo[] = [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Calculate yesterday as starting point
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // Generate 5 consecutive days starting from yesterday
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(yesterday);
    currentDate.setDate(yesterday.getDate() + i);
    
    const dateString = formatDateString(currentDate);
    const label = formatDateLabel(currentDate);
    const isFuture = currentDate > today;
    const isToday = currentDate.getTime() === today.getTime();
    
    dates.push({
      date: currentDate,
      dateString,
      label,
      isFuture,
      isToday
    });
  }
  
  return dates;
}

/**
 * Calculate calendar weeks for the current month
 * Breaks the month into proper calendar weeks (Sunday to Saturday)
 */
export function calculateMonthViewWeeks(referenceDate: Date = new Date()): WeekInfo[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  // Get first and last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const weeks: WeekInfo[] = [];
  let weekNumber = 1;
  let currentDate = new Date(firstDay);
  
  // Move to the first Sunday of the week containing the first day
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(firstDay.getDate() - firstDay.getDay());
  currentDate = new Date(firstSunday);
  
  while (currentDate <= lastDay || currentDate.getDay() !== 0) {
    const weekStart = new Date(currentDate);
    const weekDates: Date[] = [];
    
    // Collect 7 days for this week
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(currentDate.getDate() + i);
      
      // Only include dates that fall within the target month
      if (dayDate.getMonth() === month) {
        weekDates.push(new Date(dayDate));
      }
    }
    
    // Only create week if it has dates in the target month
    if (weekDates.length > 0) {
      const weekEnd = new Date(weekDates[weekDates.length - 1]);
      
      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        label: `Week ${weekNumber}`,
        dates: weekDates
      });
      
      weekNumber++;
    }
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    
    // Break if we've gone past the month and completed a full week
    if (currentDate.getMonth() !== month && currentDate.getDay() === 0) {
      break;
    }
  }
  
  return weeks;
}

/**
 * Calculate complete calendar months for multi-month views
 * Includes current month plus N previous months
 */
export function calculateMultiMonthView(monthCount: number, referenceDate: Date = new Date()): MonthInfo[] {
  const months: MonthInfo[] = [];
  const currentDate = new Date(referenceDate);
  
  // Start from the oldest month and work forward
  for (let i = monthCount - 1; i >= 0; i--) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    // First day of the month
    const startDate = new Date(year, month, 1);
    // Last day of the month
    const endDate = new Date(year, month + 1, 0);
    
    const label = formatMonthLabel(monthDate);
    
    months.push({
      month,
      year,
      startDate,
      endDate,
      label
    });
  }
  
  return months;
}

/**
 * Helper function to format date as YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper function to format date label as MM/DD
 */
function formatDateLabel(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * Helper function to format month label (e.g., "Jan", "Feb")
 */
function formatMonthLabel(date: Date): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[date.getMonth()];
}

/**
 * Utility function to check if a date falls within a date range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const normalizedStart = new Date(startDate);
  normalizedStart.setHours(0, 0, 0, 0);
  
  const normalizedEnd = new Date(endDate);
  normalizedEnd.setHours(23, 59, 59, 999);
  
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * Get today's date normalized to start of day
 */
export function getTodayNormalized(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
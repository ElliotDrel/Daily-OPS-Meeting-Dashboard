// Date Range Calculation Utilities
// Provides calendar-aware date range calculations for different time period views

export interface DateInfo {
  date: Date;
  dateString: string; // YYYY-MM-DD format
  label: string; // Display label (e.g., "07/30", "Week 1", "Jul")
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
 * Calculate dates for week view (5 work days: Monday through Friday of current work week)
 * If today is Wednesday: Monday, Tuesday, Wednesday, Thursday, Friday
 */
export function calculateWeekViewDates(referenceDate: Date = new Date()): DateInfo[] {
  const dates: DateInfo[] = [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Find Monday of the current work week
  // Saturday and Sunday belong to the PRIOR work week
  const monday = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  let daysToSubtract;
  if (dayOfWeek === 0) { // Sunday
    daysToSubtract = 6; // Go back 6 days to previous Monday
  } else if (dayOfWeek === 6) { // Saturday  
    daysToSubtract = 5; // Go back 5 days to previous Monday
  } else { // Monday (1) through Friday (5)
    daysToSubtract = dayOfWeek - 1; // Go back to current week's Monday
  }
  
  monday.setDate(today.getDate() - daysToSubtract);
  
  // Generate 5 work days starting from Monday
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    
    const dateString = formatDateString(currentDate);
    const label = formatDateLabel(currentDate);
    const isToday = currentDate.getTime() === today.getTime();
    
    dates.push({
      date: currentDate,
      dateString,
      label,
      isToday
    });
  }
  
  return dates;
}

/**
 * Calculate calendar weeks for the current month
 * Breaks the month into proper calendar weeks (Monday to Sunday)
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
  
  // Move to the first Monday of the week containing the first day
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
  
  
  firstMonday.setDate(firstDay.getDate() - daysToSubtract);
  currentDate = new Date(firstMonday);
  
  
  while (currentDate <= lastDay || currentDate.getDay() !== 1) {
    const weekStart = new Date(currentDate);
    const weekDates: Date[] = [];
    
    
    // Collect 7 days for this week (Monday to Sunday)
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
      // Week always ends on Sunday (6 days after Monday start)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      
      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        label: `W${weekNumber}`,
        dates: weekDates
      });
      
      weekNumber++;
    }
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    
    
    // Break if we've gone past the month and completed a full week
    if (currentDate.getMonth() !== month && currentDate.getDay() === 1) {
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

/**
 * Helper function to get day name from day number
 */
function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}
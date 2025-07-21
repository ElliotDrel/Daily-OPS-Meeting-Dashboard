import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const px = (n: number, k = 1) => `${n * k}px`;

interface CalendarProps {
  size?: "regular" | "mini";
  scale?: number;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  showHeader?: boolean;
  showNavigation?: boolean;
  className?: string;
}

function styleFor(size: "regular" | "mini", k = 1) {
  if (size === "regular") {
    return {
      root:    "p-4",
      header:  { pad: "p-3", text: "text-base", icon: "w-5 h-5" },
      weekday: { font: "text-xs", gap: "gap-1" },
      cell:    { font: "text-sm", py: "py-2" },
      weekdayLabels: ["Su","Mo","Tu","We","Th","Fr","Sa"],
    };
  }
  /* ---- mini ---- */
  return {
    rootPad:  px(6, k),                               // outer padding
    headerPad:`${px(4, k)} ${px(4, k)} ${px(2, k)}`,  // t r b l
    headerFS: px(13, k),                              // font‑size
    iconHW:   px(14, k),
    weekdayFS:px(10.5, k),
    weekdayGap:px(1*k),                               // = gap‑px
    cellFS:   px(11.5, k),
    cellPY:   px(0*k),
    weekdayLabels: ["S","M","T","W","T","F","S"],
  };
}

const Calendar: React.FC<CalendarProps> = ({
  size = "regular",
  scale = 1,
  selectedDate = new Date(),
  onDateSelect,
  month = new Date(),
  onMonthChange,
  showHeader = true,
  showNavigation = true,
  className = ''
}) => {
  const st = styleFor(size, scale);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentMonth = month.getMonth();
  const currentYear = month.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1);
    onMonthChange?.(newMonth);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect?.(newDate);
  };

  const isToday = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isSelected = (day: number) => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === selected.getTime();
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="calendar-day"
          style={size === "mini" ? { 
            fontSize: st.cellFS, 
            paddingTop: st.cellPY, 
            paddingBottom: st.cellPY,
            minHeight: px(32, scale),
            minWidth: px(32, scale),
            aspectRatio: '1'
          } : {}}
        />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const selected = isSelected(day);
      const todayFlag = isToday(day);
      
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={[
            'calendar-day',
            size === "regular" ? st.cell.font + " " + st.cell.py + " h-10" : "",
            'flex items-center justify-center rounded-md transition-colors',
            'border-2 border-transparent',
            'font-medium',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            selected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : todayFlag
                ? 'bg-gray-100 text-gray-900 font-bold'
                : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
          style={size === "mini" ? { 
            fontSize: st.cellFS, 
            paddingTop: st.cellPY, 
            paddingBottom: st.cellPY,
            minHeight: px(32, scale),
            minWidth: px(32, scale),
            aspectRatio: '1'
          } : {}}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  if (size === "regular") {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${st.root} ${className}`}>
        {showHeader && (
          <div className={`flex items-center justify-between border-b ${st.header.pad}`}>
            {showNavigation ? (
              <button
                onClick={() => navigateMonth('prev')}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors`}
                aria-label="Previous month"
              >
                <ChevronLeft className={st.header.icon + " text-gray-600"} />
              </button>
            ) : (
              <div className={`p-2`} style={{ width: `calc(${st.header.icon.split(' ')[0]} + 1rem)` }}>
                {/* Spacer for alignment */}
              </div>
            )}
            <h2 className={`${st.header.text} font-semibold text-gray-900 text-center flex-1`}>
              {monthNames[currentMonth]} {currentYear}
            </h2>
            {showNavigation ? (
              <button
                onClick={() => navigateMonth('next')}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors`}
                aria-label="Next month"
              >
                <ChevronRight className={st.header.icon + " text-gray-600"} />
              </button>
            ) : (
              <div className={`p-2`} style={{ width: `calc(${st.header.icon.split(' ')[0]} + 1rem)` }}>
                {/* Spacer for alignment */}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col p-3">
          <div className={`calendar-days-header grid grid-cols-7 ${st.weekday.gap} mb-1`}>
            {st.weekdayLabels.map((day, i) => (
              <div key={i} className={`text-center font-medium text-gray-500 ${st.weekday.font} px-2 py-1`}>
                {day}
              </div>
            ))}
          </div>

          <div className={`calendar-days grid grid-cols-7 ${st.weekday.gap} flex-1`}>
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    );
  }

  // Mini version with scaled inline styles
  return (
    <div
      className={`bg-white rounded-lg border shadow-sm ${className}`}
      style={{ padding: st.rootPad }}
    >
      {showHeader && (
        <div
          className="flex items-center justify-between border-b"
          style={{ padding: st.headerPad }}
        >
          {showNavigation ? (
            <button
              onClick={() => navigateMonth('prev')}
              className="hover:bg-gray-100 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft style={{ width: st.iconHW, height: st.iconHW }} className="text-gray-600" />
            </button>
          ) : (
            <div style={{ width: st.iconHW, height: st.iconHW }}>
              {/* Spacer for alignment */}
            </div>
          )}
          <h2 className="font-semibold text-gray-900 text-center flex-1" style={{ fontSize: st.headerFS }}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          {showNavigation ? (
            <button
              onClick={() => navigateMonth('next')}
              className="hover:bg-gray-100 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight style={{ width: st.iconHW, height: st.iconHW }} className="text-gray-600" />
            </button>
          ) : (
            <div style={{ width: st.iconHW, height: st.iconHW }}>
              {/* Spacer for alignment */}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col" style={{ paddingTop: px(2, scale) }}>
        <div
          className="grid grid-cols-7"
          style={{ gap: st.weekdayGap }}
        >
          {st.weekdayLabels.map((day, i) => (
            <div
              key={i}
              className="text-center font-medium text-gray-500"
              style={{ fontSize: st.weekdayFS }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="calendar-days grid grid-cols-7"
          style={{ gap: st.weekdayGap, marginTop: px(1, scale) }}
        >
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

export { Calendar };

// Demo component to show it working
export default function CalendarDemo() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [month, setMonth] = React.useState(new Date());

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Working Calendar</h1>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
        />
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Selected date:</p>
          <p className="text-lg font-medium text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
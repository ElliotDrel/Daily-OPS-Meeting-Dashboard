import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay'
import { styled } from '@mui/material/styles'

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
  value?: Date
  onChange?: (date: Date | null) => void
}

const StyledPickersDay = styled(PickersDay)(({ theme, selected, today }) => ({
  fontSize: '0.875rem',
  width: '36px',
  height: '36px',
  fontWeight: 'normal',
  color: selected ? 'white' : 'inherit',
  backgroundColor: selected 
    ? 'hsl(var(--primary))' 
    : today 
    ? 'hsl(var(--accent))' 
    : 'transparent',
  '&:hover': {
    backgroundColor: selected 
      ? 'hsl(var(--primary))' 
      : 'hsl(var(--accent))',
  },
  '&:focus': {
    backgroundColor: selected 
      ? 'hsl(var(--primary))' 
      : 'hsl(var(--accent))',
  },
  '&.MuiPickersDay-dayOutsideMonth': {
    color: 'hsl(var(--muted-foreground))',
    opacity: 0.5,
  },
  '&.Mui-disabled': {
    color: 'hsl(var(--muted-foreground))',
    opacity: 0.5,
  },
}))

const StyledDateCalendar = styled(DateCalendar)({
  '& .MuiPickersCalendarHeader-root': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '4px',
    position: 'relative',
  },
  '& .MuiPickersCalendarHeader-label': {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  '& .MuiPickersArrowSwitcher-root': {
    display: 'flex',
    gap: '4px',
  },
  '& .MuiPickersArrowSwitcher-button': {
    height: '28px',
    width: '28px',
    backgroundColor: 'transparent',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
    },
  },
  '& .MuiPickersArrowSwitcher-button.MuiPickersArrowSwitcher-spacer': {
    position: 'absolute',
  },
  '& .MuiPickersArrowSwitcher-button:first-of-type': {
    position: 'absolute',
    left: '4px',
  },
  '& .MuiPickersArrowSwitcher-button:last-of-type': {
    position: 'absolute',
    right: '4px',
  },
  '& .MuiDayCalendar-header': {
    display: 'flex',
  },
  '& .MuiDayCalendar-weekDayLabel': {
    color: 'hsl(var(--muted-foreground))',
    borderRadius: '6px',
    width: '36px',
    fontWeight: 'normal',
    fontSize: '0.8rem',
  },
  '& .MuiDayCalendar-weekContainer': {
    display: 'flex',
    width: '100%',
    marginTop: '8px',
  },
  '& .MuiDateCalendar-root': {
    width: '100%',
    borderCollapse: 'collapse',
  },
})

function CustomDay(props: PickersDayProps<Date>) {
  return <StyledPickersDay {...props} />
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  value,
  onChange,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StyledDateCalendar
          value={value}
          onChange={onChange}
          slots={{
            day: CustomDay,
            leftArrowIcon: () => <ChevronLeft className="h-4 w-4" />,
            rightArrowIcon: () => <ChevronRight className="h-4 w-4" />,
          }}
          showDaysOutsideCurrentMonth={showOutsideDays}
          {...props}
        />
      </LocalizationProvider>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
import { addWeeks, format, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarToolbarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function CalendarToolbar({ currentDate, onDateChange }: CalendarToolbarProps) {
  return (
    <div className="flex shrink-0 items-center border-b border-border/60 px-5 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
            className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
            className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => onDateChange(new Date())}
          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          This week
        </button>
      </div>
    </div>
  )
}

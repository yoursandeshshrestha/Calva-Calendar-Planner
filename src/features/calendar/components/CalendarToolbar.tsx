import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarToolbarProps {
  monthLabel: string
  showToday: boolean
  onToday: () => void
  onPrev: () => void
  onNext: () => void
}

export function CalendarToolbar({
  monthLabel,
  showToday,
  onToday,
  onPrev,
  onNext,
}: CalendarToolbarProps) {
  return (
    <div className="flex shrink-0 items-center border-b border-border/60 px-5 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Scroll back one week"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Scroll forward one week"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
        {showToday && (
          <button
            type="button"
            onClick={onToday}
            className="cursor-pointer rounded-md border border-border/70 px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Today
          </button>
        )}
      </div>
    </div>
  )
}

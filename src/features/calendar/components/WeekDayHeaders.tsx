import { format, isToday } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { GRID_BORDER, TIME_GUTTER_WIDTH } from '../constants'

interface WeekDayHeadersProps {
  weekDays: Date[]
  loading: boolean
}

export function WeekDayHeaders({ weekDays, loading }: WeekDayHeadersProps) {
  return (
    <div className={cn('flex shrink-0 border-b bg-white dark:bg-background', GRID_BORDER)}>
      <div
        className={cn('shrink-0 border-r', GRID_BORDER)}
        style={{ width: TIME_GUTTER_WIDTH }}
      />
      {weekDays.map((day) => {
        const today = isToday(day)
        return (
          <div
            key={day.toISOString()}
            className={cn('flex flex-1 flex-col items-center border-r py-2 last:border-r-0', GRID_BORDER)}
          >
            {loading ? (
              <>
                <Skeleton className="h-3 w-7 rounded" />
                <Skeleton className="mt-1.5 size-7 rounded-full" />
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex size-7 items-center justify-center text-sm font-semibold',
                    today && 'rounded-full bg-[#6835D0] text-white',
                    !today && 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

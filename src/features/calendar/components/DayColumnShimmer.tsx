import { Skeleton } from '@/components/ui/skeleton'
import { DAY_END_HOUR, DAY_START_HOUR, HOUR_HEIGHT, TOP_PADDING_ROWS } from '../constants'

export function DayColumnShimmer() {
  return (
    <div className="absolute inset-0 flex flex-col">
      {Array.from({ length: TOP_PADDING_ROWS }).map((_, i) => (
        <div key={`pad-${i}`} style={{ height: HOUR_HEIGHT }} />
      ))}
      {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }).map((_, hour) => (
        <div key={hour} className="px-1.5 py-1" style={{ height: HOUR_HEIGHT }}>
          <Skeleton className="h-full w-full rounded" />
        </div>
      ))}
    </div>
  )
}

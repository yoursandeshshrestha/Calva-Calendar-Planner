import { useEffect, useMemo, useRef } from 'react'
import { format, isSameDay } from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  EVENT_GAP,
  GRID_BORDER,
  HOUR_GRID_BACKGROUND,
  HOUR_HEIGHT,
  TIME_GUTTER_WIDTH,
  TOP_PADDING_ROWS,
  TOTAL_GRID_HEIGHT,
} from '../constants'
import { getFirstEventScrollTop, layoutDayEvents } from '../utils/layout'
import { DayColumnShimmer } from './DayColumnShimmer'
import { TimedEventBlock } from './TimedEventBlock'

interface TimeGridProps {
  weekDays: Date[]
  events: CalendarEvent[]
  loading: boolean
  selectedEventId?: string
  onEventSelect: (event: CalendarEvent, anchor: HTMLElement) => void
}

export function TimeGrid({
  weekDays,
  events,
  loading,
  selectedEventId,
  onEventSelect,
}: TimeGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const timeSlots = useMemo(
    () => Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i),
    [],
  )

  const firstEventScrollTop = useMemo(() => getFirstEventScrollTop(events), [events])

  useEffect(() => {
    if (loading || firstEventScrollTop === null) return
    const el = scrollContainerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = firstEventScrollTop
    })
  }, [loading, firstEventScrollTop])

  const eventsForDay = (day: Date) =>
    events.filter((event) => isSameDay(new Date(event.start), day))

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-background"
    >
      <div
        className="relative flex min-w-[720px] bg-white dark:bg-background"
        style={{ height: TOTAL_GRID_HEIGHT }}
      >
        <div
          className={cn('relative shrink-0 border-r bg-white dark:bg-background', GRID_BORDER)}
          style={{ width: TIME_GUTTER_WIDTH }}
        >
          {Array.from({ length: TOP_PADDING_ROWS }).map((_, i) => (
            <div key={`pad-${i}`} style={{ height: HOUR_HEIGHT }} />
          ))}
          {timeSlots.map((hour) => (
            <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
              <div className="absolute top-0 right-0 flex w-full -translate-y-1/2 items-center justify-end pr-2.5">
                <span className="bg-white px-0.5 text-[11px] leading-none tabular-nums text-muted-foreground dark:bg-background">
                  {format(new Date(2000, 0, 1, hour, 0), 'h a').toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {weekDays.map((day) => {
          const dayEvents = eventsForDay(day)
          const positioned = layoutDayEvents(dayEvents)

          return (
            <div
              key={day.toISOString()}
              className={cn('relative flex-1 overflow-hidden border-r last:border-r-0', GRID_BORDER)}
              style={{ height: TOTAL_GRID_HEIGHT, ...HOUR_GRID_BACKGROUND }}
            >
              {loading ? (
                <DayColumnShimmer />
              ) : (
                positioned.map(({ event, top, height, column, totalColumns }) => {
                  const widthPercent = 100 / totalColumns
                  const leftPercent = column * widthPercent
                  const insetTop = top + EVENT_GAP / 2
                  const insetHeight = Math.max(height - EVENT_GAP, 4)

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'absolute z-10 overflow-hidden px-1',
                        selectedEventId === event.id && 'z-20',
                      )}
                      style={{
                        top: insetTop,
                        height: insetHeight,
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    >
                      <TimedEventBlock
                        event={event}
                        height={insetHeight}
                        selected={selectedEventId === event.id}
                        onClick={(anchor) => onEventSelect(event, anchor)}
                      />
                    </div>
                  )
                })
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { isSameDay } from 'date-fns'
import { Video } from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'
import { getEventAppearance } from '../utils/appearance'
import { getEventSubtitle } from '../utils/format'

interface AllDayEventPillProps {
  event: CalendarEvent
  selected?: boolean
  onClick: (anchor: HTMLElement) => void
}

export function AllDayEventPill({ event, selected, onClick }: AllDayEventPillProps) {
  const appearance = getEventAppearance(event.color)
  const subtitle = getEventSubtitle(event)

  return (
    <button
      type="button"
      onClick={(e) => onClick(e.currentTarget)}
      title={event.title}
      className={cn(
        'flex w-full cursor-pointer flex-col rounded px-1.5 py-1 text-left text-[11px] leading-tight transition-all hover:brightness-[0.97]',
        selected && 'ring-2 ring-[#6835D0]/60 ring-offset-1',
      )}
      style={appearance.bg}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate font-semibold" style={appearance.text}>
          {event.title}
        </p>
        {event.meetLink && (
          <Video className="size-3 shrink-0 opacity-80" style={appearance.text} />
        )}
      </div>
      <p className="mt-0.5 truncate font-normal" style={appearance.mutedText}>
        {subtitle}
      </p>
    </button>
  )
}

interface AllDayEventsRowProps {
  weekDays: Date[]
  allDayEvents: CalendarEvent[]
  selectedEventId?: string
  onEventSelect: (event: CalendarEvent, anchor: HTMLElement) => void
}

export function AllDayEventsRow({
  weekDays,
  allDayEvents,
  selectedEventId,
  onEventSelect,
}: AllDayEventsRowProps) {
  if (allDayEvents.length === 0) return null

  return (
    <div className="flex shrink-0 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-background">
      <div
        className="flex shrink-0 items-start justify-end border-r border-gray-200 pr-2 pt-1.5 dark:border-gray-800"
        style={{ width: 64 }}
      >
        <span className="text-[10px] text-muted-foreground">all-day</span>
      </div>
      {weekDays.map((day) => {
        const dayAllDay = allDayEvents.filter((e) => isSameDay(new Date(e.start), day))
        return (
          <div
            key={day.toISOString()}
            className="flex min-h-7 flex-1 flex-col gap-1.5 border-r border-gray-200 p-1.5 last:border-r-0 dark:border-gray-800"
          >
            {dayAllDay.map((event) => (
              <AllDayEventPill
                key={event.id}
                event={event}
                selected={selectedEventId === event.id}
                onClick={(anchor) => onEventSelect(event, anchor)}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

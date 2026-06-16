import { format } from 'date-fns'
import { Video } from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'
import { getEventAppearance } from '../utils/appearance'
import { getEventSubtitle } from '../utils/format'

interface TimedEventBlockProps {
  event: CalendarEvent
  height: number
  selected?: boolean
  onClick: (anchor: HTMLElement) => void
}

export function TimedEventBlock({ event, height, selected, onClick }: TimedEventBlockProps) {
  const start = new Date(event.start)
  const timeLabel = format(start, 'h:mm a')
  const appearance = getEventAppearance(event.color)
  const showSubtitle = height >= 40
  const subtitle = getEventSubtitle(event)

  return (
    <button
      type="button"
      onClick={(e) => onClick(e.currentTarget)}
      title={`${event.title} · ${timeLabel}`}
      className={cn(
        'flex h-full min-h-0 w-full cursor-pointer flex-col justify-center overflow-hidden rounded px-1.5 py-1 text-left text-[11px] leading-tight transition-all hover:brightness-[0.97]',
        selected && 'ring-2 ring-[#6835D0]/60 ring-offset-1',
      )}
      style={appearance.bg}
    >
      <div className="flex min-h-0 min-w-0 items-center justify-between gap-1">
        <p className="min-w-0 flex-1 truncate font-semibold" style={appearance.text}>
          {event.title}
        </p>
        {event.meetLink && (
          <Video className="size-3 shrink-0 opacity-80" style={appearance.text} />
        )}
      </div>
      {showSubtitle && (
        <p className="mt-0.5 truncate font-normal" style={appearance.mutedText}>
          {subtitle}
        </p>
      )}
    </button>
  )
}

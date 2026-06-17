import { format, formatDistanceToNowStrict, isToday, isTomorrow } from 'date-fns'
import { Video } from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'
import { isEventHappeningNow } from '../utils/upcoming'

function formatUpcomingLabel(event: CalendarEvent, now: Date) {
  const start = new Date(event.start)

  if (isEventHappeningNow(event, now)) return 'Happening now'

  const distance = formatDistanceToNowStrict(start, { addSuffix: true })
  if (isToday(start)) return `Today · ${format(start, 'h:mm a')}`
  if (isTomorrow(start)) return `Tomorrow · ${format(start, 'h:mm a')}`
  return `${format(start, 'EEE, MMM d · h:mm a')} · ${distance}`
}

interface UpcomingEventFloatingCardProps {
  event: CalendarEvent
  now: Date
  className?: string
}

export function UpcomingEventFloatingCard({
  event,
  now,
  className,
}: UpcomingEventFloatingCardProps) {
  const happeningNow = isEventHappeningNow(event, now)
  const meetHref = event.meetLink
    ? `${event.meetLink}${event.meetLink.includes('?') ? '&' : '?'}authuser=${encodeURIComponent(event.accountEmail)}`
    : null

  return (
    <aside
      className={cn(
        'pointer-events-auto fixed right-5 bottom-5 z-50 w-[min(100vw-2.5rem,22rem)]',
        className,
      )}
      aria-live="polite"
      aria-label="Upcoming event"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-lg shadow-black/10 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
        <div className="flex">
          <div className="w-1 shrink-0" style={{ backgroundColor: event.color }} />
          <div className="min-w-0 flex-1 p-3.5">
            <p className="text-[10px] font-semibold tracking-wide text-[#6835D0] uppercase">
              {happeningNow ? 'In progress' : 'Up next'}
            </p>
            <p className="mt-1 truncate text-[14px] font-semibold text-foreground">
              {event.title}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
              {formatUpcomingLabel(event, now)}
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
              {event.accountEmail}
            </p>

            {meetHref && (
              <a
                href={meetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#6835D0] text-[12px] font-medium text-white transition-colors hover:bg-[#5628B8]"
              >
                <Video className="size-3.5" />
                Join meeting
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

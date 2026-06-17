import { format, formatDistanceToNowStrict, isToday } from 'date-fns'
import { Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'
import { formatDuration, formatTimeRange, getMeetLinkWithAuth } from '../utils/format'
import { isEventHappeningNow } from '../utils/upcoming'

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
  const start = new Date(event.start)
  const end = new Date(event.end)
  const happeningNow = isEventHappeningNow(event, now)
  const accountInitial = event.accountEmail[0]?.toUpperCase() ?? '?'
  const locationLabel = event.meetLink ? 'Google Meet' : event.location
  const statusLabel = happeningNow
    ? 'Happening now'
    : `Starts ${formatDistanceToNowStrict(start, { addSuffix: true })}`

  return (
    <aside
      className={cn(
        'pointer-events-auto fixed right-5 bottom-5 z-50 w-[min(360px,calc(100vw-2rem))]',
        className,
      )}
      aria-live="polite"
      aria-label="Upcoming event"
    >
      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-background">
        <div className="shrink-0 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: event.color }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold leading-snug text-foreground">
                {event.title}
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {formatTimeRange(start, end, event.allDay)}
                {!event.allDay && `, ${formatDuration(start, end)}`}
              </p>
              <p className="mt-1 text-[12px] font-medium text-[#6835D0]">{statusLabel}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isToday(start) ? (
              <span className="rounded bg-violet-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-violet-600 uppercase dark:bg-violet-950 dark:text-violet-400">
                Today
              </span>
            ) : (
              <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
                {format(start, 'EEE, MMM d')}
              </span>
            )}
            <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
              Up next
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarFallback
                className="text-[10px] font-medium text-white"
                style={{ backgroundColor: event.color }}
              >
                {accountInitial}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-[13px] text-muted-foreground">
              {event.accountEmail}
            </span>
          </div>

          {locationLabel && (
            <p className="truncate text-[13px] text-foreground">{locationLabel}</p>
          )}
        </div>

        {event.meetLink && (
          <div className="shrink-0 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            <Button
              asChild
              className="h-9 w-full cursor-pointer rounded-xl bg-[#6835D0] text-[13px] font-medium text-white hover:bg-[#5628B8]"
            >
              <a
                href={getMeetLinkWithAuth(event.meetLink, event.accountEmail)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="mr-1.5 size-3.5" />
                Join meeting
              </a>
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

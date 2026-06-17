import type { CalendarEvent } from '@/types/calendar'

export function getNextUpcomingEvent(
  events: CalendarEvent[],
  now = new Date(),
): CalendarEvent | null {
  return (
    events
      .filter((event) => new Date(event.end) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] ?? null
  )
}

export function isEventHappeningNow(event: CalendarEvent, now = new Date()) {
  const start = new Date(event.start)
  const end = new Date(event.end)
  return start <= now && end > now
}

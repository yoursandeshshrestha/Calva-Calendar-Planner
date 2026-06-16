import { format } from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'

export function formatEventTimeRange(start: Date, end: Date) {
  const samePeriod = format(start, 'a') === format(end, 'a')
  if (samePeriod) {
    return `${format(start, 'h:mm')} – ${format(end, 'h:mm a')}`
  }
  return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
}

export function getEventSubtitle(event: CalendarEvent) {
  const start = new Date(event.start)
  const end = new Date(event.end)
  if (event.description?.trim()) {
    return event.description.trim()
  }
  if (event.location?.trim()) {
    return event.location.trim()
  }
  return formatEventTimeRange(start, end)
}

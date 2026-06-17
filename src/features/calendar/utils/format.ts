import { differenceInMinutes, format } from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'

export function formatEventTimeRange(start: Date, end: Date) {
  const samePeriod = format(start, 'a') === format(end, 'a')
  if (samePeriod) {
    return `${format(start, 'h:mm')} – ${format(end, 'h:mm a')}`
  }
  return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
}

export function formatDuration(start: Date, end: Date) {
  const mins = differenceInMinutes(end, start)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const remainder = mins % 60
  if (remainder === 0) return hours === 1 ? '1 hr' : `${hours} hr`
  return `${hours} hr ${remainder} min`
}

export function formatTimeRange(start: Date, end: Date, allDay: boolean) {
  if (allDay) return 'All day'
  const samePeriod = format(start, 'a') === format(end, 'a')
  if (samePeriod) {
    return `${format(start, 'h')} – ${format(end, 'h:mma').toLowerCase()}`
  }
  return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
}

export function getMeetLinkWithAuth(meetLink: string, accountEmail: string) {
  const separator = meetLink.includes('?') ? '&' : '?'
  return `${meetLink}${separator}authuser=${encodeURIComponent(accountEmail)}`
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

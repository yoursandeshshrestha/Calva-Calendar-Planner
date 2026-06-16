import type { CalendarEvent } from '@/types/calendar'
import { functionsUrl, getAuthHeaders } from './client'

export async function fetchCalendarEvents(
  timeMin: string,
  timeMax: string,
): Promise<CalendarEvent[]> {
  const headers = await getAuthHeaders()
  const params = new URLSearchParams({ timeMin, timeMax })

  const response = await fetch(`${functionsUrl}/calendar-events?${params}`, {
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch calendar events')
  }

  const { events } = await response.json()
  return events
}

import type { CalendarEvent } from '@/types/calendar'
import { functionsUrl, getAuthHeaders } from './client'

export async function fetchCalendarEvents(
  timeMin: string,
  timeMax: string,
  accountId?: string,
): Promise<CalendarEvent[]> {
  const headers = await getAuthHeaders()
  const params = new URLSearchParams({ timeMin, timeMax })
  if (accountId) params.set('accountId', accountId)

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

export async function fetchCalendarEventsForAccounts(
  timeMin: string,
  timeMax: string,
  accountIds: string[],
  onAccountEvents: (accountId: string, events: CalendarEvent[]) => void,
): Promise<void> {
  const results = await Promise.allSettled(
    accountIds.map(async (accountId) => {
      const events = await fetchCalendarEvents(timeMin, timeMax, accountId)
      onAccountEvents(accountId, events)
      return events
    }),
  )

  const failures = results.filter((result) => result.status === 'rejected')
  if (failures.length === results.length) {
    const reason = failures[0].status === 'rejected' ? failures[0].reason : null
    throw reason instanceof Error ? reason : new Error('Failed to fetch calendar events')
  }
}

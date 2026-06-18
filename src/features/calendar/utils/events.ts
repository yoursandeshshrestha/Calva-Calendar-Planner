import type { CalendarEvent } from '@/types/calendar'

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}

export function mergeAccountEvents(
  previous: CalendarEvent[],
  accountId: string,
  accountEvents: CalendarEvent[],
  accountColor?: string,
) {
  const withoutAccount = previous.filter((event) => event.accountId !== accountId)
  const nextEvents = accountEvents.map((event) => ({
    ...event,
    color: accountColor ?? event.color,
  }))

  return sortCalendarEvents([...withoutAccount, ...nextEvents])
}

function eventKey(event: Pick<CalendarEvent, 'accountId' | 'id'>) {
  return `${event.accountId}:${event.id}`
}

export function mergeEventsById(
  previous: CalendarEvent[],
  incoming: CalendarEvent[],
  accountColor?: string,
) {
  if (incoming.length === 0) return previous

  const byKey = new Map<string, CalendarEvent>()
  for (const event of previous) byKey.set(eventKey(event), event)
  for (const event of incoming) {
    byKey.set(eventKey(event), {
      ...event,
      color: accountColor ?? event.color,
    })
  }

  return sortCalendarEvents([...byKey.values()])
}

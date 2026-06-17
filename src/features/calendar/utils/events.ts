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

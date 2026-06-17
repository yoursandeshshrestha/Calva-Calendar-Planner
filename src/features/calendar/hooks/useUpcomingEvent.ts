import { useEffect, useMemo, useState } from 'react'
import { addDays, endOfDay } from 'date-fns'
import { fetchCalendarEventsForAccounts, getConnectedAccounts } from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'
import { mergeAccountEvents } from '../utils/events'
import { getNextUpcomingEvent } from '../utils/upcoming'

export function useUpcomingEvent(accessToken?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!accessToken) {
      setEvents([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setEvents([])

      try {
        const accountList = await getConnectedAccounts()
        if (cancelled) return

        if (accountList.length === 0) {
          setEvents([])
          return
        }

        const timeMin = new Date().toISOString()
        const timeMax = endOfDay(addDays(new Date(), 14)).toISOString()
        const accountColors = Object.fromEntries(accountList.map((a) => [a.id, a.color]))

        await fetchCalendarEventsForAccounts(
          timeMin,
          timeMax,
          accountList.map((account) => account.id),
          (accountId, accountEvents) => {
            if (cancelled) return
            setEvents((previous) =>
              mergeAccountEvents(previous, accountId, accountEvents, accountColors[accountId]),
            )
          },
        )
      } catch {
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const refresh = window.setInterval(load, 5 * 60 * 1000)

    return () => {
      cancelled = true
      window.clearInterval(refresh)
    }
  }, [accessToken])

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(tick)
  }, [])

  const upcomingEvent = useMemo(
    () => getNextUpcomingEvent(events, now),
    [events, now],
  )

  return { upcomingEvent, loading, now }
}

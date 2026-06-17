import { useEffect, useMemo, useState } from 'react'
import { addDays, endOfDay } from 'date-fns'
import { fetchCalendarEvents } from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'
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
      try {
        const timeMin = new Date().toISOString()
        const timeMax = endOfDay(addDays(new Date(), 14)).toISOString()
        const eventList = await fetchCalendarEvents(timeMin, timeMax)
        if (!cancelled) setEvents(eventList)
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

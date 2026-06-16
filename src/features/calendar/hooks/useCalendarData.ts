import { useCallback, useEffect, useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import { connectGoogleAccount, fetchCalendarEvents, getConnectedAccounts } from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'
import type { ConnectedAccount } from '@/types/database'

interface UseCalendarDataOptions {
  weekStart: Date
  weekEnd: Date
  accessToken?: string
}

export function useCalendarData({ weekStart, weekEnd, accessToken }: UseCalendarDataOptions) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [accountList, eventList] = await Promise.all([
          getConnectedAccounts(),
          fetchCalendarEvents(
            startOfDay(weekStart).toISOString(),
            endOfDay(weekEnd).toISOString(),
          ),
        ])
        const accountColors = Object.fromEntries(accountList.map((a) => [a.id, a.color]))
        setAccounts(accountList)
        setEvents(
          eventList.map((event) => ({
            ...event,
            color: accountColors[event.accountId] ?? event.color,
          })),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [weekStart, weekEnd, accessToken])

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const url = await connectGoogleAccount()
      window.location.href = url
    } catch (err) {
      setConnecting(false)
      throw err
    }
  }, [])

  return {
    events,
    accounts,
    loading,
    error,
    connecting,
    handleConnect,
  }
}

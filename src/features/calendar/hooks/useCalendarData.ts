import { useCallback, useEffect, useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import {
  connectGoogleAccount,
  fetchCalendarEventsForAccounts,
  getConnectedAccounts,
} from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'
import type { ConnectedAccount } from '@/types/database'
import { mergeAccountEvents } from '../utils/events'

interface UseCalendarDataOptions {
  weekStart: Date
  weekEnd: Date
  accessToken?: string
}

export function useCalendarData({ weekStart, weekEnd, accessToken }: UseCalendarDataOptions) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setEventsLoading(true)
      setError(null)
      setEvents([])

      try {
        const accountList = await getConnectedAccounts()
        if (cancelled) return

        setAccounts(accountList)
        setLoading(false)

        if (accountList.length === 0) {
          setEventsLoading(false)
          return
        }

        const timeMin = startOfDay(weekStart).toISOString()
        const timeMax = endOfDay(weekEnd).toISOString()
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
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load calendar')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setEventsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
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
    eventsLoading,
    error,
    connecting,
    handleConnect,
  }
}

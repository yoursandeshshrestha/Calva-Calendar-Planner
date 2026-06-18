import { useCallback, useEffect, useRef, useState } from 'react'
import { addWeeks, endOfDay, endOfWeek, startOfDay, startOfWeek } from 'date-fns'
import {
  connectGoogleAccount,
  fetchCalendarEventsForAccounts,
  getConnectedAccounts,
} from '@/lib/api'
import type { CalendarEvent } from '@/types/calendar'
import type { ConnectedAccount } from '@/types/database'
import { mergeEventsById } from '../utils/events'

interface UseCalendarDataOptions {
  rangeStart: Date
  rangeEnd: Date
  accessToken?: string
}

function weekChunkStarts(rangeStart: Date, rangeEnd: Date) {
  const starts: Date[] = []
  let cursor = startOfWeek(rangeStart, { weekStartsOn: 1 })
  const last = startOfWeek(rangeEnd, { weekStartsOn: 1 })
  while (cursor.getTime() <= last.getTime()) {
    starts.push(cursor)
    cursor = addWeeks(cursor, 1)
  }
  return starts
}

export function useCalendarData({ rangeStart, rangeEnd, accessToken }: UseCalendarDataOptions) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Bumped whenever the account set is reloaded so in-flight chunk fetches from
  // a previous session can be ignored.
  const epochRef = useRef(0)
  const fetchedChunksRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    const epoch = ++epochRef.current
    fetchedChunksRef.current = new Set()

    setLoading(true)
    setEventsLoading(true)
    setError(null)
    setEvents([])
    setAccounts([])

    getConnectedAccounts()
      .then((accountList) => {
        if (cancelled || epoch !== epochRef.current) return
        setAccounts(accountList)
        setLoading(false)
        if (accountList.length === 0) setEventsLoading(false)
      })
      .catch((err) => {
        if (cancelled || epoch !== epochRef.current) return
        setError(err instanceof Error ? err.message : 'Failed to load calendar')
        setLoading(false)
        setEventsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  useEffect(() => {
    if (accounts.length === 0) return

    const epoch = epochRef.current
    const accountColors = Object.fromEntries(accounts.map((a) => [a.id, a.color]))
    const accountIds = accounts.map((a) => a.id)

    const chunks = weekChunkStarts(rangeStart, rangeEnd).filter(
      (chunkStart) => !fetchedChunksRef.current.has(chunkStart.toISOString()),
    )

    if (chunks.length === 0) {
      setEventsLoading(false)
      return
    }

    for (const chunkStart of chunks) {
      fetchedChunksRef.current.add(chunkStart.toISOString())
    }

    // Fetches are additive and de-duplicated by id, so we intentionally let
    // in-flight requests finish even if the visible range changes again. Only a
    // full account reload (tracked via epoch) invalidates them.
    Promise.all(
      chunks.map((chunkStart) => {
        const timeMin = startOfDay(chunkStart).toISOString()
        const timeMax = endOfDay(endOfWeek(chunkStart, { weekStartsOn: 1 })).toISOString()

        return fetchCalendarEventsForAccounts(
          timeMin,
          timeMax,
          accountIds,
          (accountId, accountEvents) => {
            if (epoch !== epochRef.current) return
            setEvents((previous) =>
              mergeEventsById(previous, accountEvents, accountColors[accountId]),
            )
          },
        ).catch((err) => {
          // Allow this chunk to be retried on a later scroll.
          fetchedChunksRef.current.delete(chunkStart.toISOString())
          throw err
        })
      }),
    )
      .catch((err) => {
        if (epoch !== epochRef.current) return
        setError(err instanceof Error ? err.message : 'Failed to load calendar')
      })
      .finally(() => {
        if (epoch !== epochRef.current) return
        setEventsLoading(false)
      })
  }, [accounts, rangeStart, rangeEnd])

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

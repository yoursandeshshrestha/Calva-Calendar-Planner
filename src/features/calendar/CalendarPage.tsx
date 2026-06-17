import { useEffect, useMemo, useState } from 'react'
import { endOfWeek, startOfWeek } from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'
import { useAuth } from '@/contexts/AuthContext'
import { AllDayEventsRow } from './components/AllDayEventsRow'
import { CalendarToolbar } from './components/CalendarToolbar'
import { EmptyCalendarState } from './components/EmptyCalendarState'
import { EventDetailPopover } from './components/EventDetailPopover'
import { TimeGrid } from './components/TimeGrid'
import { UpcomingEventFloatingCard } from './components/UpcomingEventFloatingCard'
import { WeekDayHeaders } from './components/WeekDayHeaders'
import { useCalendarData } from './hooks/useCalendarData'
import { useOAuthCallback } from './hooks/useOAuthCallback'
import { useUpcomingEvent } from './hooks/useUpcomingEvent'

export function CalendarPage() {
  const { session, signOut } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventPopover, setEventPopover] = useState<{
    event: CalendarEvent
    anchor: HTMLElement
  } | null>(null)

  useOAuthCallback()

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate],
  )

  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate],
  )

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        return d
      }),
    [weekStart],
  )

  const { events, accounts, loading, eventsLoading, error, connecting, handleConnect } = useCalendarData({
    weekStart,
    weekEnd,
    accessToken: session?.access_token,
  })

  const { upcomingEvent, now: upcomingNow } = useUpcomingEvent(
    session?.access_token,
  )

  useEffect(() => {
    setEventPopover(null)
  }, [weekStart])

  const handleEventSelect = (event: CalendarEvent, anchor: HTMLElement) => {
    setEventPopover((current) =>
      current?.event.id === event.id ? null : { event, anchor },
    )
  }

  const allDayEvents = useMemo(() => events.filter((e) => e.allDay), [events])

  const needsReLogin =
    !loading &&
    accounts.length === 0 &&
    (!session?.provider_token || !session?.provider_refresh_token)

  if (!loading && accounts.length === 0) {
    return (
      <EmptyCalendarState
        needsReLogin={needsReLogin}
        connecting={connecting}
        onSignOut={signOut}
        onConnect={handleConnect}
      />
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-background">
      <CalendarToolbar currentDate={currentDate} onDateChange={setCurrentDate} />

      {error && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/5 px-5 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <WeekDayHeaders weekDays={weekDays} loading={loading} />

        {!loading && (
          <AllDayEventsRow
            weekDays={weekDays}
            allDayEvents={allDayEvents}
            selectedEventId={eventPopover?.event.id}
            onEventSelect={handleEventSelect}
          />
        )}

        <TimeGrid
          weekDays={weekDays}
          events={events}
          loading={eventsLoading && events.length === 0}
          selectedEventId={eventPopover?.event.id}
          onEventSelect={handleEventSelect}
        />
      </div>

      <EventDetailPopover
        event={eventPopover?.event ?? null}
        anchor={eventPopover?.anchor ?? null}
        open={!!eventPopover}
        onClose={() => setEventPopover(null)}
      />

      {upcomingEvent && (
        <UpcomingEventFloatingCard event={upcomingEvent} now={upcomingNow} />
      )}
    </div>
  )
}

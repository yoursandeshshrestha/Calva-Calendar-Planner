import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'
import { useAuth } from '@/contexts/AuthContext'
import { AllDayEventsRow } from './components/AllDayEventsRow'
import { CalendarToolbar } from './components/CalendarToolbar'
import { EmptyCalendarState } from './components/EmptyCalendarState'
import { EventDetailPopover } from './components/EventDetailPopover'
import { TimeGrid } from './components/TimeGrid'
import { UpcomingEventFloatingCard } from './components/UpcomingEventFloatingCard'
import { WeekDayHeaders } from './components/WeekDayHeaders'
import { TIME_GUTTER_WIDTH } from './constants'
import { useCalendarData } from './hooks/useCalendarData'
import { useOAuthCallback } from './hooks/useOAuthCallback'
import { useUpcomingEvent } from './hooks/useUpcomingEvent'
import { getFirstEventScrollTop } from './utils/layout'

const TODAY_COLUMN_INDEX = 2
const INITIAL_DAYS = 28
const EXTEND_DAYS = 14
const EDGE_THRESHOLD_PX = 800

export function CalendarPage() {
  const { session, signOut } = useAuth()
  const today = useMemo(() => startOfDay(new Date()), [])

  const [rangeStart, setRangeStart] = useState(() =>
    subDays(startOfDay(new Date()), TODAY_COLUMN_INDEX),
  )
  const [rangeDays, setRangeDays] = useState(INITIAL_DAYS)
  const [monthLabel, setMonthLabel] = useState(() => format(new Date(), 'MMMM yyyy'))
  const [todayVisible, setTodayVisible] = useState(true)
  const [eventPopover, setEventPopover] = useState<{
    event: CalendarEvent
    anchor: HTMLElement
  } | null>(null)

  useOAuthCallback()

  const rangeEnd = useMemo(
    () => endOfDay(addDays(rangeStart, rangeDays - 1)),
    [rangeStart, rangeDays],
  )

  const weekDays = useMemo(
    () => Array.from({ length: rangeDays }, (_, i) => addDays(rangeStart, i)),
    [rangeStart, rangeDays],
  )

  const { events, accounts, loading, eventsLoading, error, connecting, handleConnect } =
    useCalendarData({
      rangeStart,
      rangeEnd,
      accessToken: session?.access_token,
    })

  const { upcomingEvent, now: upcomingNow } = useUpcomingEvent(session?.access_token)

  const gridScrollRef = useRef<HTMLDivElement>(null)
  const gridLoading = eventsLoading && events.length === 0
  const firstEventScrollTop = useMemo(() => getFirstEventScrollTop(events), [events])

  // Coordinates the imperative horizontal scroll adjustments.
  const prependPrevWidthRef = useRef<number | null>(null)
  const pendingScrollLeftRef = useRef<number | null>(null)
  const extendingRef = useRef(false)
  const tickingRef = useRef(false)
  const lastScrollLeftRef = useRef(0)
  const didInitialVerticalScrollRef = useRef(false)

  const updateMetrics = useCallback(() => {
    const el = gridScrollRef.current
    if (!el) return
    const colWidth = (el.scrollWidth - TIME_GUTTER_WIDTH) / rangeDays
    if (!colWidth || !Number.isFinite(colWidth)) return

    const { scrollLeft, clientWidth } = el

    const leftIndex = Math.max(0, Math.floor(scrollLeft / colWidth))
    setMonthLabel(format(addDays(rangeStart, leftIndex), 'MMMM yyyy'))

    const todayIndex = differenceInCalendarDays(today, rangeStart)
    const todayLeft = TIME_GUTTER_WIDTH + todayIndex * colWidth
    const todayRight = todayLeft + colWidth
    const visibleLeft = scrollLeft + TIME_GUTTER_WIDTH
    const visibleRight = scrollLeft + clientWidth
    setTodayVisible(todayRight > visibleLeft && todayLeft < visibleRight)
  }, [rangeDays, rangeStart, today])

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return
    tickingRef.current = true
    requestAnimationFrame(() => {
      tickingRef.current = false
      const el = gridScrollRef.current
      if (!el) return

      updateMetrics()

      const { scrollLeft, clientWidth, scrollWidth } = el
      const direction = scrollLeft - lastScrollLeftRef.current
      lastScrollLeftRef.current = scrollLeft

      if (extendingRef.current || direction === 0) return

      if (direction > 0 && scrollLeft + clientWidth > scrollWidth - EDGE_THRESHOLD_PX) {
        extendingRef.current = true
        setRangeDays((days) => days + EXTEND_DAYS)
      } else if (direction < 0 && scrollLeft < EDGE_THRESHOLD_PX) {
        extendingRef.current = true
        prependPrevWidthRef.current = scrollWidth
        setRangeStart((start) => subDays(start, EXTEND_DAYS))
        setRangeDays((days) => days + EXTEND_DAYS)
      }
    })
  }, [updateMetrics])

  // Keep the viewport anchored when prepending days, apply pending jumps, and
  // refresh derived metrics after any range change.
  useLayoutEffect(() => {
    const el = gridScrollRef.current
    if (!el) return

    if (prependPrevWidthRef.current !== null) {
      el.scrollLeft += el.scrollWidth - prependPrevWidthRef.current
      prependPrevWidthRef.current = null
    }
    if (pendingScrollLeftRef.current !== null) {
      el.scrollLeft = pendingScrollLeftRef.current
      pendingScrollLeftRef.current = null
    }

    lastScrollLeftRef.current = el.scrollLeft
    extendingRef.current = false
    updateMetrics()
  }, [rangeStart, rangeDays, updateMetrics])

  // One-time vertical scroll to the first event of the initial range.
  useEffect(() => {
    if (didInitialVerticalScrollRef.current) return
    if (gridLoading || firstEventScrollTop === null) return
    const el = gridScrollRef.current
    if (!el) return
    didInitialVerticalScrollRef.current = true
    requestAnimationFrame(() => {
      el.scrollTop = firstEventScrollTop
    })
  }, [gridLoading, firstEventScrollTop])

  const goToToday = useCallback(() => {
    setEventPopover(null)
    setRangeStart(subDays(today, TODAY_COLUMN_INDEX))
    setRangeDays(INITIAL_DAYS)
    pendingScrollLeftRef.current = 0
  }, [today])

  const scrollByDays = useCallback((days: number) => {
    const el = gridScrollRef.current
    if (!el) return
    const colWidth = (el.scrollWidth - TIME_GUTTER_WIDTH) / rangeDays
    el.scrollBy({ left: days * colWidth, behavior: 'smooth' })
  }, [rangeDays])

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
      <CalendarToolbar
        monthLabel={monthLabel}
        showToday={!todayVisible}
        onToday={goToToday}
        onPrev={() => scrollByDays(-7)}
        onNext={() => scrollByDays(7)}
      />

      {error && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/5 px-5 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={gridScrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-auto bg-white dark:bg-background"
        >
          <div className="flex w-max min-w-full flex-col">
            <div className="sticky top-0 z-30 bg-white dark:bg-background">
              <WeekDayHeaders weekDays={weekDays} loading={loading} />

              {!loading && (
                <AllDayEventsRow
                  weekDays={weekDays}
                  allDayEvents={allDayEvents}
                  selectedEventId={eventPopover?.event.id}
                  onEventSelect={handleEventSelect}
                />
              )}
            </div>

            <TimeGrid
              weekDays={weekDays}
              events={events}
              loading={gridLoading}
              selectedEventId={eventPopover?.event.id}
              onEventSelect={handleEventSelect}
            />
          </div>
        </div>
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

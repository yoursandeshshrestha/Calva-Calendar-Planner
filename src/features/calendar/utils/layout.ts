import { isSameDay } from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  EVENT_GAP,
  HOUR_HEIGHT,
  TOP_PADDING_HEIGHT,
} from '../constants'

export function clampEventTimes(start: Date, end: Date) {
  const dayStart = DAY_START_HOUR * 60
  const dayEnd = DAY_END_HOUR * 60
  let endMins = end.getHours() * 60 + end.getMinutes()

  if (endMins === 0 && end.getTime() > start.getTime() && !isSameDay(start, end)) {
    endMins = dayEnd
  }

  const startMins = Math.max(dayStart, start.getHours() * 60 + start.getMinutes())
  endMins = Math.min(dayEnd, Math.max(endMins, startMins + 1))
  const durationHeight = ((endMins - startMins) / 60) * HOUR_HEIGHT

  return {
    top: TOP_PADDING_HEIGHT + ((startMins - dayStart) / 60) * HOUR_HEIGHT,
    height: Math.max(durationHeight, 6),
  }
}

export function layoutDayEvents(dayEvents: CalendarEvent[]) {
  const timed = dayEvents
    .filter((e) => !e.allDay)
    .map((event) => {
      const start = new Date(event.start)
      const end = new Date(event.end)
      const { top, height } = clampEventTimes(start, end)
      return { event, top, height, start, end }
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const columns: Array<typeof timed> = []

  for (const item of timed) {
    let placed = false
    for (const column of columns) {
      const last = column[column.length - 1]
      if (last.top + last.height + EVENT_GAP <= item.top) {
        column.push(item)
        placed = true
        break
      }
    }
    if (!placed) columns.push([item])
  }

  const totalColumns = columns.length
  const positioned: Array<typeof timed[0] & { column: number; totalColumns: number }> = []

  columns.forEach((column, columnIndex) => {
    column.forEach((item) => {
      positioned.push({ ...item, column: columnIndex, totalColumns })
    })
  })

  return positioned
}

export function getFirstEventScrollTop(events: CalendarEvent[]) {
  const timed = events.filter((e) => !e.allDay)
  if (timed.length === 0) return null

  const earliest = timed.reduce((min, e) =>
    new Date(e.start) < new Date(min.start) ? e : min,
  )

  const { top } = clampEventTimes(new Date(earliest.start), new Date(earliest.end))
  return Math.max(0, top - HOUR_HEIGHT)
}

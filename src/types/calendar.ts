export type AttendeeResponseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted'

export interface CalendarEventAttendee {
  email: string
  displayName?: string
  organizer: boolean
  responseStatus: AttendeeResponseStatus
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  allDay: boolean
  location?: string
  meetLink?: string
  htmlLink?: string
  accountId: string
  accountEmail: string
  color: string
  attendees?: CalendarEventAttendee[]
  organizer?: { email: string; displayName?: string }
  reminders?: {
    useDefault: boolean
    overrides: Array<{ method: string; minutes: number }>
  }
  visibility?: 'default' | 'public' | 'private' | 'confidential'
  busy?: boolean
}

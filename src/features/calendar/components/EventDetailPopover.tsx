import { useEffect, useState, type ReactNode } from 'react'
import { differenceInMinutes, format, isToday } from 'date-fns'
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  HelpCircle,
  Video,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { AttendeeResponseStatus, CalendarEvent, CalendarEventAttendee } from '@/types/calendar'
import { cn } from '@/lib/utils'

const DESCRIPTION_PREVIEW_LENGTH = 140

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}

function formatDuration(start: Date, end: Date) {
  const mins = differenceInMinutes(end, start)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const remainder = mins % 60
  if (remainder === 0) return hours === 1 ? '1 hr' : `${hours} hr`
  return `${hours} hr ${remainder} min`
}

function formatTimeRange(start: Date, end: Date, allDay: boolean) {
  if (allDay) return 'All day'
  const samePeriod = format(start, 'a') === format(end, 'a')
  if (samePeriod) {
    return `${format(start, 'h')} – ${format(end, 'h:mma').toLowerCase()}`
  }
  return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
}

function formatReminders(reminders: CalendarEvent['reminders']) {
  if (!reminders || reminders.useDefault) return 'Default reminder'
  if (reminders.overrides.length === 0) return 'No reminder'

  const first = reminders.overrides[0]
  const unit =
    first.minutes >= 1440 && first.minutes % 1440 === 0
      ? `${first.minutes / 1440}d before`
      : first.minutes >= 60 && first.minutes % 60 === 0
        ? `${first.minutes / 60}h before`
        : `${first.minutes}m before`
  if (reminders.overrides.length === 1) return unit
  return `${unit} +${reminders.overrides.length - 1}`
}

function formatVisibility(visibility: CalendarEvent['visibility']) {
  switch (visibility) {
    case 'public':
      return 'Public'
    case 'private':
      return 'Private'
    case 'confidential':
      return 'Confidential'
    default:
      return 'Default visibility'
  }
}

function attendeeLabel(attendee: CalendarEventAttendee) {
  return attendee.displayName?.trim() || attendee.email
}

function attendeeInitial(attendee: CalendarEventAttendee) {
  const label = attendeeLabel(attendee)
  const parts = label.split(/[@\s.]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return label.slice(0, 2).toUpperCase()
}

function sortAttendees(attendees: CalendarEventAttendee[]) {
  return [...attendees].sort((a, b) => {
    if (a.organizer !== b.organizer) return a.organizer ? -1 : 1
    return attendeeLabel(a).localeCompare(attendeeLabel(b))
  })
}

function isExternalMeeting(accountEmail: string, attendees: CalendarEventAttendee[]) {
  const domain = accountEmail.split('@')[1]
  if (!domain) return false
  return attendees.some((a) => {
    const guestDomain = a.email.split('@')[1]
    return guestDomain && guestDomain.toLowerCase() !== domain.toLowerCase()
  })
}

function responseSummary(attendees: CalendarEventAttendee[]) {
  const accepted = attendees.filter((a) => a.responseStatus === 'accepted').length
  const declined = attendees.filter((a) => a.responseStatus === 'declined').length
  const pending = attendees.length - accepted - declined
  const parts: string[] = []
  if (accepted) parts.push(`${accepted} yes`)
  if (pending) parts.push(`${pending} pending`)
  if (declined) parts.push(`${declined} no`)
  return parts.join(' · ')
}

function ResponseIcon({ status }: { status: AttendeeResponseStatus }) {
  if (status === 'accepted') {
    return <Check className="size-3 shrink-0 text-emerald-600" strokeWidth={2.5} />
  }
  if (status === 'declined') {
    return <XCircle className="size-3 shrink-0 text-red-500" strokeWidth={2.5} />
  }
  return <HelpCircle className="size-3 shrink-0 text-muted-foreground/70" strokeWidth={2.5} />
}

function MetaTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function GuestRow({ attendee }: { attendee: CalendarEventAttendee }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <Avatar className="size-6">
        <AvatarFallback className="bg-muted text-[9px] font-medium text-muted-foreground">
          {attendeeInitial(attendee)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] text-foreground">{attendeeLabel(attendee)}</p>
          <ResponseIcon status={attendee.responseStatus} />
        </div>
        {attendee.organizer && (
          <p className="text-[11px] text-muted-foreground">Organizer</p>
        )}
      </div>
    </div>
  )
}

export function EventDetailPopover({
  event,
  anchor,
  open,
  onClose,
}: {
  event: CalendarEvent | null
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
}) {
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)

  useEffect(() => {
    if (!event) return
    setGuestsOpen((event.attendees?.length ?? 0) <= 4)
    setDescriptionOpen(false)
  }, [event?.id])

  if (!event || !anchor) return null

  const start = new Date(event.start)
  const end = new Date(event.end)
  const description = event.description ? stripHtml(event.description) : null
  const longDescription = description && description.length > DESCRIPTION_PREVIEW_LENGTH
  const attendees = event.attendees?.length ? sortAttendees(event.attendees) : []
  const externalMeeting = attendees.length > 0 && isExternalMeeting(event.accountEmail, attendees)
  const accountInitial = event.accountEmail[0]?.toUpperCase() ?? '?'
  const locationLabel = event.meetLink ? 'Google Meet' : event.location

  const metaTags = [
    formatReminders(event.reminders),
    event.busy === false ? 'Free' : 'Busy',
    formatVisibility(event.visibility),
    externalMeeting ? 'External' : null,
  ].filter(Boolean)

  const copyMeetLink = async () => {
    if (!event.meetLink) return
    try {
      await navigator.clipboard.writeText(event.meetLink)
      toast.success('Link copied')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleClose = () => {
    setGuestsOpen(false)
    setDescriptionOpen(false)
    onClose()
  }

  return (
    <Popover open={open} onOpenChange={(next) => !next && handleClose()}>
      <PopoverAnchor virtualRef={{ current: anchor }} />
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        collisionPadding={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn(
          'z-50 flex max-h-[min(70vh,520px)] w-[min(360px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-xl ring-0 dark:border-gray-800 dark:bg-background',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold leading-snug text-foreground">
                  {event.title}
                </h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {formatTimeRange(start, end, event.allDay)}
                  {!event.allDay && `, ${formatDuration(start, end)}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-3.5 px-4 py-3">
            {description && !longDescription && (
              <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {isToday(start) ? (
                <span className="rounded bg-violet-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-violet-600 uppercase dark:bg-violet-950 dark:text-violet-400">
                  Today
                </span>
              ) : (
                <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
                  {format(start, 'EEE, MMM d')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarFallback
                  className="text-[10px] font-medium text-white"
                  style={{ backgroundColor: event.color }}
                >
                  {accountInitial}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-[13px] text-muted-foreground">
                {event.accountEmail}
              </span>
            </div>

            {locationLabel && (
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13px] text-foreground">{locationLabel}</p>
                {event.meetLink && (
                  <button
                    type="button"
                    onClick={copyMeetLink}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Copy meeting link"
                  >
                    <Copy className="size-3.5" />
                  </button>
                )}
              </div>
            )}

            {event.location && event.meetLink && event.location !== event.meetLink && (
              <p className="-mt-2 truncate text-[12px] text-muted-foreground">{event.location}</p>
            )}

            {attendees.length > 0 && (
              <Collapsible open={guestsOpen} onOpenChange={setGuestsOpen}>
                <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg py-0.5 text-left transition-colors hover:bg-muted/50">
                  <div>
                    <SectionLabel>Guests</SectionLabel>
                    <p className="-mt-1 text-[13px] text-foreground">
                      {attendees.length} {attendees.length === 1 ? 'guest' : 'guests'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{responseSummary(attendees)}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'mr-1 size-4 shrink-0 text-muted-foreground transition-transform',
                      guestsOpen && 'rotate-180',
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1">
                  <div className="max-h-40 overflow-y-auto overscroll-contain rounded-lg bg-muted/30 px-2">
                    {attendees.map((attendee) => (
                      <GuestRow key={attendee.email} attendee={attendee} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {longDescription && (
              <div className="min-w-0">
                <SectionLabel>Notes</SectionLabel>
                <p className="break-words text-[13px] leading-relaxed text-muted-foreground">
                  {descriptionOpen
                    ? description
                    : `${description!.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…`}
                </p>
                <button
                  type="button"
                  onClick={() => setDescriptionOpen((v) => !v)}
                  className="mt-1 cursor-pointer text-[12px] font-medium text-foreground hover:underline"
                >
                  {descriptionOpen ? 'Show less' : 'Show more'}
                </button>
              </div>
            )}

            {metaTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {metaTags.map((tag) => (
                  <MetaTag key={tag}>{tag}</MetaTag>
                ))}
              </div>
            )}
          </div>
        </div>

        {(event.meetLink || event.htmlLink) && (
          <div className="shrink-0 space-y-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            {event.meetLink && (
              <Button
                asChild
                className="h-9 w-full cursor-pointer rounded-xl bg-[#6835D0] text-[13px] font-medium text-white hover:bg-[#5628B8]"
              >
                <a href={event.meetLink} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-1.5 size-3.5" />
                  Join meeting
                </a>
              </Button>
            )}

            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground hover:underline"
              >
                <ExternalLink className="size-3.5" />
                {event.meetLink ? 'View in Google Calendar' : 'Open in Google Calendar'}
              </a>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

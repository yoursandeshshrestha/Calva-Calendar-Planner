const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export interface GoogleUserInfo {
  email: string
  name: string
  picture: string
}

export interface GoogleCalendarAttendee {
  email?: string
  displayName?: string
  organizer?: boolean
  self?: boolean
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
}

export interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  hangoutLink?: string
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>
  }
  attendees?: GoogleCalendarAttendee[]
  organizer?: { email?: string; displayName?: string; self?: boolean }
  reminders?: {
    useDefault?: boolean
    overrides?: Array<{ method?: string; minutes?: number }>
  }
  visibility?: 'default' | 'public' | 'private' | 'confidential'
  transparency?: 'opaque' | 'transparent'
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<GoogleTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  return response.json()
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info')
  }

  return response.json()
}

export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Calendar fetch failed: ${error}`)
  }

  const data = await response.json()
  return data.items ?? []
}

export const ACCOUNT_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
]

export function stableEventColor(googleEventId: string): string {
  let hash = 0
  for (let i = 0; i < googleEventId.length; i++) {
    hash = googleEventId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return ACCOUNT_COLORS[Math.abs(hash) % ACCOUNT_COLORS.length]
}

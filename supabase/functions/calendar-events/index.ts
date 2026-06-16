import { fetchCalendarEvents, refreshAccessToken } from '../_shared/google.ts'
import { corsHeaders, createServiceClient, createUserClient } from '../_shared/supabase.ts'

interface ConnectedAccount {
  id: string
  google_email: string
  color: string
  access_token: string
  refresh_token: string
  token_expires_at: string
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    const userClient = createUserClient(authHeader)
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const timeMin = url.searchParams.get('timeMin')
    const timeMax = url.searchParams.get('timeMax')

    if (!timeMin || !timeMax) {
      return new Response(JSON.stringify({ error: 'timeMin and timeMax are required' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createServiceClient()
    const { data: accounts, error: accountsError } = await serviceClient
      .from('connected_google_accounts')
      .select('id, google_email, color, access_token, refresh_token, token_expires_at')
      .eq('user_id', user.id)

    if (accountsError) {
      throw new Error(accountsError.message)
    }

    if (!accounts?.length) {
      return new Response(JSON.stringify({ events: [] }), {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    const allEvents: Array<Record<string, unknown>> = []

    for (const account of accounts as ConnectedAccount[]) {
      let accessToken = account.access_token

      try {
        if (new Date(account.token_expires_at) <= new Date()) {
          const refreshed = await refreshAccessToken(account.refresh_token)
          accessToken = refreshed.access_token
          const tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

          await serviceClient
            .from('connected_google_accounts')
            .update({
              access_token: accessToken,
              token_expires_at: tokenExpiresAt,
              ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
            })
            .eq('id', account.id)
        }

        const events = await fetchCalendarEvents(accessToken, timeMin, timeMax)

        for (const event of events) {
          const meetLink =
            event.hangoutLink ??
            event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri

          allEvents.push({
            id: `${account.id}-${event.id}`,
            title: event.summary ?? '(No title)',
            description: event.description,
            start: event.start.dateTime ?? event.start.date,
            end: event.end.dateTime ?? event.end.date,
            allDay: !event.start.dateTime,
            location: event.location,
            meetLink,
            htmlLink: event.htmlLink,
            accountId: account.id,
            accountEmail: account.google_email,
            color: account.color,
            attendees: event.attendees?.map((a) => ({
              email: a.email ?? '',
              displayName: a.displayName,
              organizer: a.organizer ?? false,
              responseStatus: a.responseStatus ?? 'needsAction',
            })).filter((a) => a.email),
            organizer: event.organizer?.email
              ? {
                  email: event.organizer.email,
                  displayName: event.organizer.displayName,
                }
              : undefined,
            reminders: event.reminders
              ? {
                  useDefault: event.reminders.useDefault ?? true,
                  overrides: (event.reminders.overrides ?? []).map((r) => ({
                    method: r.method ?? 'popup',
                    minutes: r.minutes ?? 0,
                  })),
                }
              : undefined,
            visibility: event.visibility ?? 'default',
            busy: event.transparency !== 'transparent',
          })
        }
      } catch (accountError) {
        console.error(`Failed to fetch events for ${account.google_email}:`, accountError)
      }
    }

    allEvents.sort((a, b) => {
      const aStart = new Date(a.start as string).getTime()
      const bStart = new Date(b.start as string).getTime()
      return aStart - bStart
    })

    return new Response(JSON.stringify({ events: allEvents }), {
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    })
  }
})

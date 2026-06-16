import { CALENDAR_SCOPES } from '../_shared/google.ts'
import { corsHeaders, createServiceClient, createUserClient } from '../_shared/supabase.ts'

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

    const serviceClient = createServiceClient()
    const state = crypto.randomUUID()

    const { error: stateError } = await serviceClient
      .from('oauth_states')
      .insert({
        user_id: user.id,
        state,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })

    if (stateError) {
      throw new Error(stateError.message)
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-callback`
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')

    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: CALENDAR_SCOPES,
      access_type: 'offline',
      prompt: 'consent select_account',
      state,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

    return new Response(JSON.stringify({ url: authUrl }), {
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

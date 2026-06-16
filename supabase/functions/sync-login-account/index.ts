import { ACCOUNT_COLORS, getGoogleUserInfo } from '../_shared/google.ts'
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

    const { access_token, refresh_token } = await req.json()

    if (!access_token || !refresh_token) {
      return new Response(JSON.stringify({ error: 'Missing provider tokens' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      })
    }

    const userInfo = await getGoogleUserInfo(access_token)
    const serviceClient = createServiceClient()

    const { data: existingAccount } = await serviceClient
      .from('connected_google_accounts')
      .select('color')
      .eq('user_id', user.id)
      .eq('google_email', userInfo.email)
      .maybeSingle()

    let color = existingAccount?.color
    if (!color) {
      const { data: existingAccounts } = await serviceClient
        .from('connected_google_accounts')
        .select('color')
        .eq('user_id', user.id)

      const usedColors = new Set((existingAccounts ?? []).map((a) => a.color))
      color = ACCOUNT_COLORS.find((c) => !usedColors.has(c)) ?? ACCOUNT_COLORS[0]
    }
    const tokenExpiresAt = new Date(Date.now() + 3600 * 1000).toISOString()

    const { error: upsertError } = await serviceClient
      .from('connected_google_accounts')
      .upsert(
        {
          user_id: user.id,
          google_email: userInfo.email,
          google_name: userInfo.name,
          google_picture: userInfo.picture,
          access_token,
          refresh_token,
          token_expires_at: tokenExpiresAt,
          color,
        },
        { onConflict: 'user_id,google_email' },
      )

    if (upsertError) {
      throw new Error(upsertError.message)
    }

    return new Response(JSON.stringify({ success: true, email: userInfo.email }), {
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

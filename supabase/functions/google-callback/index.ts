import {
  ACCOUNT_COLORS,
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from '../_shared/google.ts'
import { createServiceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

  if (error) {
    return Response.redirect(`${appUrl}/?error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    return Response.redirect(`${appUrl}/?error=missing_params`)
  }

  try {
    const serviceClient = createServiceClient()

    const { data: oauthState, error: stateError } = await serviceClient
      .from('oauth_states')
      .select('user_id, expires_at')
      .eq('state', state)
      .single()

    if (stateError || !oauthState) {
      return Response.redirect(`${appUrl}/?error=invalid_state`)
    }

    if (new Date(oauthState.expires_at) < new Date()) {
      await serviceClient.from('oauth_states').delete().eq('state', state)
      return Response.redirect(`${appUrl}/?error=state_expired`)
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-callback`
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    if (!tokens.refresh_token) {
      return Response.redirect(`${appUrl}/?error=no_refresh_token`)
    }

    const userInfo = await getGoogleUserInfo(tokens.access_token)
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const { data: existingAccount } = await serviceClient
      .from('connected_google_accounts')
      .select('color')
      .eq('user_id', oauthState.user_id)
      .eq('google_email', userInfo.email)
      .maybeSingle()

    let color = existingAccount?.color
    if (!color) {
      const { data: existingAccounts } = await serviceClient
        .from('connected_google_accounts')
        .select('color')
        .eq('user_id', oauthState.user_id)

      const usedColors = new Set((existingAccounts ?? []).map((a) => a.color))
      color = ACCOUNT_COLORS.find((c) => !usedColors.has(c)) ?? ACCOUNT_COLORS[0]
    }

    const { error: upsertError } = await serviceClient
      .from('connected_google_accounts')
      .upsert(
        {
          user_id: oauthState.user_id,
          google_email: userInfo.email,
          google_name: userInfo.name,
          google_picture: userInfo.picture,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokenExpiresAt,
          color,
        },
        { onConflict: 'user_id,google_email' },
      )

    if (upsertError) {
      throw new Error(upsertError.message)
    }

    await serviceClient.from('oauth_states').delete().eq('state', state)

    return Response.redirect(`${appUrl}/?connected=true`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'callback_failed'
    return Response.redirect(`${appUrl}/?error=${encodeURIComponent(message)}`)
  }
})

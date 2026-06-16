import { supabase } from '@/lib/supabase'
import type { ConnectedAccount } from '@/types/database'
import { functionsUrl, getAuthHeaders } from './client'

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  const { data, error } = await supabase.rpc('get_connected_accounts')

  if (error) throw error
  return data ?? []
}

export async function connectGoogleAccount(): Promise<string> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${functionsUrl}/google-connect`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to start Google connection')
  }

  const { url } = await response.json()
  return url
}

export async function disconnectAccount(accountId: string): Promise<void> {
  const { error } = await supabase
    .from('connected_google_accounts')
    .delete()
    .eq('id', accountId)

  if (error) throw error
}

export async function syncLoginAccount(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${functionsUrl}/sync-login-account`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to sync login account')
  }
}

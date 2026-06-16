import { supabase } from '@/lib/supabase'

export const functionsUrl = `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1`

export async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }
}

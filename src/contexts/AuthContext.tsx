import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { syncLoginAccount } from '@/lib/api'

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function autoConnectLoginAccount(session: Session) {
  const accessToken = session.provider_token
  const refreshToken = session.provider_refresh_token

  if (!accessToken || !refreshToken) return

  try {
    await syncLoginAccount(accessToken, refreshToken)
  } catch (error) {
    console.error('Failed to auto-connect login account:', error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const syncedSessionRef = useRef<string | null>(null)

  useEffect(() => {
    const syncIfNeeded = async (currentSession: Session | null) => {
      if (!currentSession?.provider_token || !currentSession.provider_refresh_token) return
      if (syncedSessionRef.current === currentSession.access_token) return

      await autoConnectLoginAccount(currentSession)
      syncedSessionRef.current = currentSession.access_token
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      await syncIfNeeded(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setLoading(false)

        if (event === 'SIGNED_IN' && session) {
          await syncIfNeeded(session)
        }

        if (event === 'SIGNED_OUT') {
          syncedSessionRef.current = null
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: `openid email profile ${CALENDAR_SCOPE}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
